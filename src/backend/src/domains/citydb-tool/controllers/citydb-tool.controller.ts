import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  CityDbToolService
} from '../services/citydb-tool.service';
import { ExportQueryDto } from '../dto/export-gml.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import express from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/domains/auth/decorators/current-user.decorator';
import { UserResponseDto } from 'src/domains/users/dto/user-response.dto';
import { ImportMode } from '../enums/import-mode.enum';
import { ExportFileOptions } from '../interfaces/citydb-tool.interface';
import * as fs from 'fs';

@ApiTags('CityDB Tool')
@ApiBearerAuth()
@Controller('citydb-tool')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitydbToolController {
  private readonly logger = new Logger(CitydbToolController.name);

  constructor(private readonly cityDbToolService: CityDbToolService) {}

  @Post('import/citygml')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 200 * 1024 * 1024, // 200 mb
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
        importMode: {
          type: 'string',
          enum: Object.values(ImportMode),
          default: ImportMode.SKIP,
          description: 'Import mode to determine action when an ID conflict occurs: ' +
                     'skip (ignore existing), overwrite (replace existing), ' +
                     'terminate (logical delete of old version), or error (abort import)'
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'CityGML file containing city model data to be imported',
        }
      },
    }
  })
  async importCityGml(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: UserResponseDto,
    @Body() body: { importMode: ImportMode }
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    try {
      return await this.cityDbToolService.importCityGml({
        inputFile: file.path,
        importer: currentUser.fullname,
        importMode: body.importMode
      });
    } catch (error) {
      this.logger.error(error)
      throw new InternalServerErrorException('Failed to import gml data')
    } finally {
      if (file.path && fs.existsSync(file.path)) {
        fs.promises.unlink(file.path);
      }
    }
  }

  @Get('export/citygml')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async exportCityGml(
    @Query() query: ExportQueryDto,
    @Res() res: express.Response,
  ) {
    const filename = query.filename ? query.filename : 'exported.gml';
    if (!filename.includes('.gml')) throw new BadRequestException('Wrong file extension');

    const path = await this.cityDbToolService.exportCityGml({
      outputFile: filename,
      ...query
    } as ExportFileOptions);

    res.download(path, filename, (err?: Error) => {
      if (err) {
        this.logger.error(
          `Error sending exported CityGML file: ${err.message}`,
          err.stack,
        );
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      }
    });
  }

  @Post('import/cityjson')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async importCityJson(
    @CurrentUser() currentUser: UserResponseDto,
  ) {
    return await this.cityDbToolService.importCityJson({
      inputFile: 'new.json',
      importer: currentUser.fullname,
      importMode: ImportMode.SKIP
    });
  }

  @Get('export/cityjson')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async exportCityJson(
    @Query() query: ExportQueryDto,
    @Res() res: express.Response,
  ) {
    const filename = query.filename ? query.filename : 'exported.json';
    const path = await this.cityDbToolService.exportCityJson({
      outputFile: filename,
      filter: query.objectid ? `objectid = '${query.objectid}'` : undefined,
      srid: query.srid ?? undefined,
    } as ExportFileOptions);

    res.download(path, filename, (err?: Error) => {
      if (err) {
        this.logger.error(
          `Error sending exported CityJSON file: ${err.message}`,
          err.stack,
        );
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      }
    });
  }
}
