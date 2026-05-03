import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Tiles3dService } from '../services/tiles3d.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { UpsertTiles3dDto } from '../dto/upsert-tiles3d.dto';
import { JwtAuthGuard } from 'src/domains/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/domains/auth/guards/roles.guard';
import { Roles } from 'src/domains/auth/decorators/roles.decorator';
import { UserRole } from 'src/domains/users/entities/user.entity';

@ApiTags('3DTiles')
@ApiBearerAuth()
@Controller('3dtiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class Tiles3dController {
  constructor(private readonly tiles3dService: Tiles3dService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add 3dtiles' })
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
        const allowedMimeTypes = ['application/x-zip-compressed', 'application/octet-stream'];
        const allowedExtensions = ['.zip'];

        if (
          !allowedMimeTypes.includes(file.mimetype) ||
          !allowedExtensions.includes(extname(file.originalname))
        ) {
          return callback(
            new BadRequestException(
              'Invalid file type. Only ZIP file are allowed.',
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
    description: 'add 3dtiles file',
    type: UpsertTiles3dDto
  })
  async add3DTile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: UpsertTiles3dDto
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.tiles3dService.upsert(createDto, file);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'update 3dtiles' })
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
        const allowedMimeTypes = ['application/x-zip-compressed', 'application/octet-stream'];
        const allowedExtensions = ['.zip'];

        if (
          !allowedMimeTypes.includes(file.mimetype) ||
          !allowedExtensions.includes(extname(file.originalname))
        ) {
          return callback(
            new BadRequestException(
              'Invalid file type. Only ZIP file are allowed.',
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
        name: {
          type: 'string'
        },
        properties: {
          type: 'object',
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
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDto: UpsertTiles3dDto
  ) {
    return this.tiles3dService.upsert(updateDto, file, id)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  async findAll() {
    return this.tiles3dService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async findOne(@Param('id') id: string) {
    return this.tiles3dService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.tiles3dService.remove3dTiles(id);
  }
}
