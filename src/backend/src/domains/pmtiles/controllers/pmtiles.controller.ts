import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PmtilesService } from '../services/pmtiles.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { CreatePmtilesDto } from '../dto/create-pmtiles.dto';
import { UpdatePmtilesDto } from '../dto/update-pmtiles.dto';
import { JwtAuthGuard } from 'src/domains/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/domains/auth/guards/roles.guard';
import { Roles } from 'src/domains/auth/decorators/roles.decorator';
import { UserRole } from 'src/domains/users/entities/user.entity';
import { CurrentUser } from 'src/domains/auth/decorators/current-user.decorator';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
type AuthenticatedUser = { id: string };

const PMTILES_FILTER = (
  _req: unknown,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  const allowedExtensions = ['.pmtiles'];
  const ext = extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    callback(
      new BadRequestException(
        'Invalid file type. Only .pmtiles files are allowed.',
      ),
      false,
    );
    return;
  }
  callback(null, true);
};

const MBTILES_FILTER = (
  _req: unknown,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  const ext = extname(file.originalname).toLowerCase();
  if (ext !== '.mbtiles') {
    callback(
      new BadRequestException(
        'Invalid file type. Only .mbtiles files are allowed.',
      ),
      false,
    );
    return;
  }
  callback(null, true);
};

const GEOJSON_FILTER = (
  _req: unknown,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  const ext = extname(file.originalname).toLowerCase();
  if (ext !== '.geojson') {
    callback(
      new BadRequestException(
        'Invalid file type. Only .geojson files are allowed.',
      ),
      false,
    );
    return;
  }
  callback(null, true);
};

const DISK_STORAGE = diskStorage({
  destination: (_req, _file, callback) => callback(null, '/data'),
  filename: (_req, file, callback) =>
    callback(
      null,
      `${randomUUID()}-${Date.now()}${extname(file.originalname)}`,
    ),
});

const FILE_LIMITS = { fileSize: 1024 * 1024 * 1024 };

const createPmtilesBodySchema = {
  schema: {
    type: 'object',
    required: ['name', 'epoch', 'bucket_name', 'file'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      epoch: { type: 'number' },
      project_usages: {
        type: 'array',
        items: { type: 'string' },
        nullable: true,
      },
      bucket_name: {
        type: 'string',
        enum: ['dt-legger', 'base-storage'],
      },
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

const updatePmtilesBodySchema = {
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string', nullable: true },
      epoch: { type: 'number' },
      project_usages: {
        type: 'array',
        items: { type: 'string' },
        nullable: true,
      },
      bucket_name: {
        type: 'string',
        enum: ['dt-legger', 'base-storage'],
      },
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
};

@ApiTags('PMTiles')
@ApiBearerAuth()
@Controller('pmtiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PmtilesController {
  constructor(private readonly pmtilesService: PmtilesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload PMTiles file' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: FILE_LIMITS,
      storage: DISK_STORAGE,
      fileFilter: PMTILES_FILTER,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody(createPmtilesBodySchema)
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePmtilesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.pmtilesService.create(dto, file, user.id);
  }

  @Post('mbtiles')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload MBTiles and convert to PMTiles' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: FILE_LIMITS,
      storage: DISK_STORAGE,
      fileFilter: MBTILES_FILTER,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody(createPmtilesBodySchema)
  async createFromMbtiles(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePmtilesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.pmtilesService.createFromMbtiles(dto, file, user.id);
  }

  @Post('geojson')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload GeoJSON and convert to PMTiles' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: FILE_LIMITS,
      storage: DISK_STORAGE,
      fileFilter: GEOJSON_FILTER,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody(createPmtilesBodySchema)
  async createFromGeojson(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePmtilesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) throw new BadRequestException('File is required');
    return this.pmtilesService.createFromGeojson(dto, file, user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'List all PMTiles' })
  async findAll() {
    return this.pmtilesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get PMTiles by ID' })
  async findOne(@Param('id') id: string) {
    return this.pmtilesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update PMTiles' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: FILE_LIMITS,
      storage: DISK_STORAGE,
      fileFilter: PMTILES_FILTER,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody(updatePmtilesBodySchema)
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UpdatePmtilesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pmtilesService.update(id, dto, file, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete PMTiles' })
  async remove(@Param('id') id: string) {
    return this.pmtilesService.remove(id);
  }
}
