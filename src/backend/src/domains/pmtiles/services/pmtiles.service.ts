import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pmtiles } from '../entities/pmtiles.entity';
import { CreatePmtilesDto } from '../dto/create-pmtiles.dto';
import { UpdatePmtilesDto } from '../dto/update-pmtiles.dto';
import { StorageService } from 'src/domains/storage/services/storage.service';
import { CacheService } from 'src/cache/cache.service';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { getPrefix } from 'src/common/common';
import { UploadFileResult } from 'src/domains/storage/interfaces/upload-file-result.interface';

const execAsync = promisify(exec);

@Injectable()
export class PmtilesService {
  private readonly logger = new Logger(PmtilesService.name);

  constructor(
    @InjectRepository(Pmtiles)
    private readonly pmtilesRepository: Repository<Pmtiles>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  async create(
    dto: CreatePmtilesDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pmtiles') {
      await this.cleanUpFiles(file.path);
      throw new BadRequestException(
        'Invalid file type. Only .pmtiles files are allowed.',
      );
    }

    const key = `${this.getPmtilesPrefix(dto.bucket_name)}/${uuidv4()}${ext}`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let uploadedFile: UploadFileResult | null = null;

    try {
      const fileBuffer = await fs.readFile(file.path);
      uploadedFile = await this.storageService.uploadFile(
        key,
        fileBuffer,
        'application/octet-stream',
        file.size,
        dto.bucket_name,
      );

      const entity = queryRunner.manager.create(Pmtiles, {
        name: dto.name,
        description: dto.description,
        epoch: dto.epoch,
        project_usages: dto.project_usages ?? [],
        filename: file.originalname,
        url: uploadedFile.url,
        file_size: file.size,
        bucket_name: dto.bucket_name,
        updated_by: userId,
      });

      const pmtiles = await queryRunner.manager.save(Pmtiles, entity);
      await this.cacheService.safeDelByPattern('pmtiles:*');
      await queryRunner.commitTransaction();
      return pmtiles;
    } catch (error) {
      this.logger.error(error);
      if (uploadedFile?.url) {
        const prefix = getPrefix(uploadedFile.url, false);
        await this.storageService.deleteFile(prefix);
      }
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to create pmtiles');
    } finally {
      await queryRunner.release();
      await this.cleanUpFiles(file.path);
    }
  }

  async createFromMbtiles(
    dto: CreatePmtilesDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mbtiles') {
      await this.cleanUpFiles(file.path);
      throw new BadRequestException(
        'Invalid file type. Only .mbtiles files are allowed.',
      );
    }

    const outputPath = path.join('/data', `converted-${Date.now()}.pmtiles`);
    const key = `${this.getPmtilesPrefix(dto.bucket_name)}/${uuidv4()}.pmtiles`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let uploadedFile: UploadFileResult | null = null;
    try {
      await this.ensureConverterCommandAvailable('tile-join');
      await execAsync(
        this.buildConverterCommand(
          'tile-join',
          `-f -o ${this.shellQuote(outputPath)} ${this.shellQuote(file.path)}`,
        ),
      );
      const fileBuffer = await fs.readFile(outputPath);
      const fileSize = (await fs.stat(outputPath)).size;
      uploadedFile = await this.storageService.uploadFile(
        key,
        fileBuffer,
        'application/octet-stream',
        fileSize,
        dto.bucket_name,
      );

      const entity = queryRunner.manager.create(Pmtiles, {
        name: dto.name,
        description: dto.description,
        epoch: dto.epoch,
        project_usages: dto.project_usages ?? [],
        filename: file.originalname.replace(/\.mbtiles$/i, '.pmtiles'),
        url: uploadedFile.url,
        file_size: fileSize,
        bucket_name: dto.bucket_name,
        updated_by: userId,
      });

      const saved = await queryRunner.manager.save(Pmtiles, entity);
      await this.cacheService.safeDelByPattern('pmtiles:*');
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      this.logger.error(error);
      if (uploadedFile?.url) {
        const prefix = getPrefix(uploadedFile.url, false);
        await this.storageService.deleteFile(prefix);
      }
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      throw new InternalServerErrorException(
        'Failed to convert MBTiles to PMTiles',
      );
    } finally {
      await queryRunner.release();
      await this.cleanUpFiles(file.path);
      await this.cleanUpFiles(outputPath);
    }
  }

  async createFromGeojson(
    dto: CreatePmtilesDto,
    file: Express.Multer.File,
    userId: string,
  ) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.geojson') {
      await this.cleanUpFiles(file.path);
      throw new BadRequestException(
        'Invalid file type. Only .geojson files are allowed.',
      );
    }

    const outputPath = path.join('/data', `converted-${Date.now()}.pmtiles`);
    const key = `${this.getPmtilesPrefix(dto.bucket_name)}/${uuidv4()}.pmtiles`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let uploadedFile: UploadFileResult | null = null;
    try {
      await this.ensureConverterCommandAvailable('tippecanoe');
      await execAsync(
        this.buildConverterCommand(
          'tippecanoe',
          `-o ${this.shellQuote(outputPath)} -zg --drop-densest-as-needed --force ${this.shellQuote(file.path)}`,
        ),
      );
      const fileBuffer = await fs.readFile(outputPath);
      const fileSize = (await fs.stat(outputPath)).size;
      uploadedFile = await this.storageService.uploadFile(
        key,
        fileBuffer,
        'application/octet-stream',
        fileSize,
        dto.bucket_name,
      );

      const outputFileName =
        file.originalname.replace(/\.(json|geojson)$/i, '') + '.pmtiles';
      const entity = queryRunner.manager.create(Pmtiles, {
        name: dto.name,
        description: dto.description,
        epoch: dto.epoch,
        project_usages: dto.project_usages ?? [],
        filename: outputFileName,
        url: uploadedFile.url,
        file_size: fileSize,
        bucket_name: dto.bucket_name,
        updated_by: userId,
      });

      const saved = await queryRunner.manager.save(Pmtiles, entity);
      await this.cacheService.safeDelByPattern('pmtiles:*');
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      this.logger.error(error);
      if (uploadedFile?.url) {
        const prefix = getPrefix(uploadedFile.url, false);
        await this.storageService.deleteFile(prefix);
      }
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      )
        throw error;
      throw new InternalServerErrorException(
        'Failed to convert GeoJSON to PMTiles',
      );
    } finally {
      await queryRunner.release();
      await this.cleanUpFiles(file.path);
      await this.cleanUpFiles(outputPath);
    }
  }

  async findAll() {
    try {
      const hash = this.cacheService.generateQueryHash({ order: 'DESC' });
      const cacheKey = await this.cacheService.generateKey(
        'pmtiles',
        'list',
        hash,
      );
      const cached = await this.cacheService.get<Pmtiles[]>(cacheKey);
      if (cached) return cached;

      const result = await this.pmtilesRepository.find({
        order: { createdAt: 'DESC' },
      });
      await this.cacheService.set(cacheKey, result);
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to fetch pmtiles data');
    }
  }

  async findOne(id: string): Promise<Pmtiles> {
    try {
      const cacheKey = await this.cacheService.generateKey(
        'pmtiles',
        'item',
        id,
      );
      const cached = await this.cacheService.get<Pmtiles>(cacheKey);
      if (cached) return cached;

      const pmtiles = await this.pmtilesRepository.findOne({ where: { id } });
      if (!pmtiles) {
        throw new NotFoundException('Pmtiles data not found');
      }
      await this.cacheService.set(cacheKey, pmtiles);
      return pmtiles;
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch pmtiles data');
    }
  }

  async update(
    id: string,
    dto: UpdatePmtilesDto,
    file: Express.Multer.File | undefined,
    userId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let uploadedFile: UploadFileResult | null = null;

    try {
      const existing = await queryRunner.manager.findOne(Pmtiles, {
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Pmtiles data not found');
      }

      const bucketName = dto.bucket_name ?? existing.bucket_name;

      if (file) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.pmtiles') {
          throw new BadRequestException(
            'Invalid file type. Only .pmtiles files are allowed.',
          );
        }

        const key = `${this.getPmtilesPrefix(bucketName)}/${uuidv4()}${ext}`;
        const fileBuffer = await fs.readFile(file.path);
        uploadedFile = await this.storageService.uploadFile(
          key,
          fileBuffer,
          'application/octet-stream',
          file.size,
          bucketName,
        );

        await queryRunner.manager.update(Pmtiles, id, {
          ...dto,
          filename: file.originalname,
          url: uploadedFile.url,
          file_size: file.size,
          updated_by: userId,
        });
      } else {
        await queryRunner.manager.update(Pmtiles, id, {
          ...dto,
          updated_by: userId,
        });
      }

      await this.cacheService.safeDelByPattern('pmtiles:*');
      await queryRunner.commitTransaction();

      if (file && existing.url) {
        const oldKey = getPrefix(existing.url, false);
        try {
          await this.storageService.deleteFile(oldKey);
        } catch (error) {
          this.logger.error(error);
        }
      }

      return this.findOne(id);
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();

      if (uploadedFile?.url) {
        const prefix = getPrefix(uploadedFile.url, false);
        await this.storageService.deleteFile(prefix);
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to update pmtiles');
    } finally {
      await queryRunner.release();
      if (file?.path) {
        await this.cleanUpFiles(file.path);
      }
    }
  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Pmtiles, {
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException('Pmtiles data not found');
      }

      await queryRunner.manager.remove(existing);
      await this.cacheService.safeDelByPattern('pmtiles:*');

      if (existing.url) {
        const key = getPrefix(existing.url, false);
        await this.storageService.deleteFile(key);
      }
      await queryRunner.commitTransaction();
      return { message: 'Successfully removed pmtiles data' };
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to remove pmtiles data');
    } finally {
      await queryRunner.release();
    }
  }

  async cleanUpFiles(filepath: string) {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async ensureConverterCommandAvailable(
    command: string,
  ): Promise<void> {
    try {
      const converterContainer = this.getConverterContainer();
      if (converterContainer) {
        await execAsync(
          `docker exec ${this.shellQuote(converterContainer)} sh -lc ${this.shellQuote(`command -v ${command}`)}`,
        );
        return;
      }

      await execAsync(`command -v ${command}`);
    } catch (error) {
      this.logger.error(
        `Required PMTiles converter command is not installed: ${command}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Required PMTiles converter command is not installed: ${command}`,
      );
    }
  }

  private buildConverterCommand(command: string, args: string): string {
    const converterContainer = this.getConverterContainer();
    if (!converterContainer) return `${command} ${args}`;

    return `docker exec ${this.shellQuote(converterContainer)} ${command} ${args}`;
  }

  private getConverterContainer(): string | null {
    const converterContainer = process.env.PMTILES_CONVERTER_CONTAINER?.trim();
    if (!converterContainer) return null;

    if (!/^[a-zA-Z0-9_.-]+$/.test(converterContainer)) {
      throw new InternalServerErrorException(
        'Invalid PMTiles converter container name',
      );
    }

    return converterContainer;
  }

  private shellQuote(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
  }

  private getPmtilesPrefix(bucketName: string): string {
    return bucketName === 'base-storage' ? 'leger-jogja/pmtiles' : 'pmtiles';
  }
}
