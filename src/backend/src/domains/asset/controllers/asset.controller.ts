import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/domains/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/domains/auth/guards/roles.guard';
import { AssetService } from '../services/asset.service';
import { Roles } from 'src/domains/auth/decorators/roles.decorator';
import { User, UserRole } from 'src/domains/users/entities/user.entity';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { QueryAssetDto } from '../dto/query-asset.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { CurrentUser } from 'src/domains/auth/decorators/current-user.decorator';
import { AddSourceFileDto } from '../dto/add-source-file.dto';
import { SourceFileService } from '../services/source-file.service';
import { UpdateSourceFileDto } from '../dto/update-source-file.dto';
import { ImportMode } from 'src/domains/citydb-tool/enums/import-mode.enum';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('asset')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly sourceFileService: SourceFileService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  async create(@Body() assetDto: CreateAssetDto) {
    return this.assetService.create(assetDto);
  }

  @Get()
  @ApiOperation({ summary: 'List assets' })
  async findAll(@Query() query: QueryAssetDto) {
    return this.assetService.findAll(query);
  }

  @Post(':id/files')
  @ApiOperation({ summary: 'Add files' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB
      },
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, '/data');
        },
        filename: (_req, file, callback) => {
          const uniqueName = `${randomUUID()}-${Date.now()}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['application/gml+xml', 'application/octet-stream'];
        const allowedExtensions = ['.gml'];

        if (
          !allowedMimeTypes.includes(file.mimetype) ||
          !allowedExtensions.includes(extname(file.originalname))
        ) {
          return callback(
            new BadRequestException(
              'Invalid file type. Only GML files are allowed.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        validFrom: {
          type: 'string',
          format: 'date-time',
          nullable: true
        },
        validTo: {
          type: 'string',
          format: 'date-time',
          nullable: true
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'CityGML file containing city model data to be imported',
        }
      },
    }
  })
  async addFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() addFile: AddSourceFileDto,
    @CurrentUser() user: User,
    @Param('id') assetId: string
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return await this.sourceFileService.create({
      ...addFile,
      assetId,
      uploadedBy: user,
      file
    })
  }

  @Put(':id/files/:fileId')
  @ApiOperation({ summary: 'Add files' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1 GB
      },
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, '/data');
        },
        filename: (_req, file, callback) => {
          const uniqueName = `${randomUUID()}-${Date.now()}${extname(file.originalname)}`;

          callback(null, uniqueName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['application/gml+xml', 'application/octet-stream'];
        const allowedExtensions = ['.gml'];

        if (
          !allowedMimeTypes.includes(file.mimetype) ||
          !allowedExtensions.includes(extname(file.originalname))
        ) {
          return callback(
            new BadRequestException(
              'Invalid file type. Only GML files are allowed.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        validFrom: {
          type: 'string',
          format: 'date-time',
          nullable: true
        },
        validTo: {
          type: 'string',
          format: 'date-time',
          nullable: true
        },
        importMode: {
          type: 'string',
          enum: Object.values(ImportMode),
          default: ImportMode.TERMINATE
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'CityGML file containing city model data to be imported',
        }
      },
    }
  })
  async updateFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body() updateFile: UpdateSourceFileDto,
    @Param('id') assetId: string,
    @Param('fileId') fileId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return await this.sourceFileService.update(
      {
        ...updateFile,
        file,
        uploadedBy: user
      },
      assetId,
      fileId,
    )
  }

  @Get(':id/files')
  async findFiles(@Param('id') assetId: string) {
    return await this.sourceFileService.findByAssetId(assetId);
  }

  @Delete(':id/files')
  async removeFilesByAssetId(@Param('id') assetId: string) {
    return await this.sourceFileService.removeByAssetId(assetId);
  }

  @Delete(':id/files/:fileId')
  async removeFilesById(
    @Param('id') assetId: string,
    @Param('fileId') fileId: string
  ) {
    return await this.sourceFileService.remove(assetId, fileId)
  }
}
