import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/domains/storage/services/storage.service';
import { UploadedFile, ZipExtractorService } from 'src/domains/storage/services/zip-extractor.service';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Tileset3dService } from 'src/domains/tiles3d/services/tileset3d.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Tiles3D } from '../entities/tiles3d.entity';
import { DataSource, Repository } from 'typeorm';
import { UpsertTiles3dDto } from '../dto/upsert-tiles3d.dto';
import { Logger } from '@nestjs/common';
import { getPrefix } from 'src/common/common';

@Injectable()
export class Tiles3dService {
    private readonly logger = new Logger(Tiles3dService.name);
    constructor(
        private readonly storageService: StorageService,
        private readonly zipExtractorService: ZipExtractorService,
        private readonly tileset3dService: Tileset3dService,
        @InjectRepository(Tiles3D)
        private readonly tiles3dRepository: Repository<Tiles3D>,
        private readonly dataSource: DataSource,
    ) { }

    async upsert(
        upsertDto: UpsertTiles3dDto,
        file?: Express.Multer.File,
        id?: string,
    ) {
        const queryRunner = await this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        let fileUrl;
        try {
            let prevTiles3d: Tiles3D | null = null;
            if (id) {
                prevTiles3d = await queryRunner.manager.findOne(Tiles3D, { where: { id } });
                if (!prevTiles3d) {
                    throw new NotFoundException('3dtiles data not found!')
                }
            }

            if (file?.path) {
                fileUrl = await this.upload3DtilesFile(file.path);
                upsertDto.url = fileUrl;
            }

            if (fileUrl) {
                const geometry = await this.tileset3dService.loadTilesetFromS3(fileUrl);
                upsertDto.geometry = () => `ST_GeogFromText('${geometry.polygon}')`;
            }

            const upsertData = {
                ...(id && { id }),
                ...upsertDto
            }
            const tiles3d = await queryRunner.manager.save(Tiles3D, upsertData);

            if (fileUrl && prevTiles3d?.url) {
                await this.storageService.deleteFolder(prevTiles3d?.url);
            }

            await queryRunner.commitTransaction();

            return await this.findOne(tiles3d.id);
        } catch (error) {
            this.logger.error(error)

            await queryRunner.rollbackTransaction();

            if (fileUrl) {
                this.logger.log(`Try to remove uploaded files from cloud storage`)

                const prefix = getPrefix(fileUrl);

                await this.storageService.deleteFolder(prefix);
                this.logger.log(`Successfully Removed uploaded files from cloud storage`)
            }

            if (error instanceof NotFoundException) throw error;

            throw new InternalServerErrorException('Failed to upload file');
        } finally {
            await queryRunner.release();
            if (file?.path) {
                this.logger.log('Remove temporary files on the local storage')
                await this.cleanUpFiles(file.path);
            }
        }
    }

    async findOne(id: string): Promise<Tiles3D> {
        try {
            const tiles3d = await this.tiles3dRepository.findOne({
                where: { id }
            })
            if (!tiles3d) {
                throw new NotFoundException('3D Tiles data Not Found')
            }

            return tiles3d;
        } catch (error) {
            this.logger.error(error)
            if (error instanceof NotFoundException) throw error;

            throw new InternalServerErrorException(`Failed to fetch 3D tiles with id : ${id}`);
        }
    }

    async findAll(): Promise<Tiles3D[]> {
        try {
            return await this.tiles3dRepository.find({
                select: {
                    id: true,
                    properties: true,
                    url: true,
                    createdAt: true
                },
            });
        } catch (error) {
            this.logger.error(error)
            throw new InternalServerErrorException('Failed to fetch 3dtiles data');
        }
    }

    async upload3DtilesFile(filepath: string, prefix?: string) {
        prefix = prefix ?? `3dtiles/${uuidv4()}`;

        const uploadedFiles: UploadedFile[] = await this.zipExtractorService.extractAndUpload(filepath, prefix)

        const mainFile = uploadedFiles.find(file => file.key.endsWith('tileset.json'))
        if (!mainFile) {
            throw new BadRequestException('Invalid 3D Tiles data: tileset.json not found in the zip file')
        }

        const { url } = mainFile
        if (!url) {
            throw new InternalServerErrorException('Failed to upload zip file')
        }

        return url;
    }

    async remove3dTiles(id: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const tiles3d = await this.findOne(id);

            await queryRunner.manager.remove(tiles3d);

            if (tiles3d.url) {
                const prefix = getPrefix(tiles3d.url)
                await this.storageService.deleteFolder(prefix);
            }

            return { message: 'Successfully removed 3dtiles data' }
        } catch (error) {
            this.logger.error(error)
            await queryRunner.rollbackTransaction();

            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to remove 3dtiles data')
        } finally {
            await queryRunner.release();
        }
    }

    async cleanUpFiles(filepath: string) {
        await fs.unlink(filepath).catch((e) => { this.logger.error(e) })
    }
}
