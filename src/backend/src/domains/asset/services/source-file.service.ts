import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SourceFile } from '../entities/source-file.entity';
import { AddSourceFileDto } from '../dto/add-source-file.dto';
import { DataSource, Repository } from 'typeorm';
import { CityDbToolService } from 'src/domains/citydb-tool/services/citydb-tool.service';
import { GmlService } from 'src/tool/services/gml/gml.service';
import { AddAttributeToGML } from 'src/tool/interfaces/gml-tool.interface';
import * as fs from 'fs';
import { AssetService } from 'src/domains/asset/services/asset.service';
import { ImportFileOptions } from 'src/domains/citydb-tool/interfaces/citydb-tool.interface';
import { ImportMode } from 'src/domains/citydb-tool/enums/import-mode.enum';
import { UpdateSourceFileDto } from '../dto/update-source-file.dto';
import { CitydbQueryService } from 'src/domains/citydb-tool/services/citydb-query.service';
import { CacheService } from 'src/cache/cache.service';
import { StorageService } from 'src/domains/storage/services/storage.service';
import { getExt, getPrefix } from 'src/common/common';
import { randomUUID } from 'crypto';
import { UploadFileResult } from 'src/domains/storage/interfaces/upload-file-result.interface';

@Injectable()
export class SourceFileService {
    private readonly logger = new Logger(SourceFileService.name);
    constructor(
        @InjectRepository(SourceFile)
        private readonly sourceFileRepository: Repository<SourceFile>,
        private readonly cityDbToolService: CityDbToolService,
        private readonly cityDbQueryService: CitydbQueryService,
        private readonly gmlService: GmlService,
        private readonly assetService: AssetService,
        private readonly cacheService: CacheService,
        private readonly storageService: StorageService,
        private dataSource: DataSource,
    ) { }

    async create(createDto: AddSourceFileDto): Promise<{ message: string, data: SourceFile }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let outputPath: string | null = null;
        let sourceFile: SourceFile | null = null;
        let uploadedFile: UploadFileResult | null = null;

        try {
            if (!createDto.file) throw new BadRequestException('File is required!');

            // Upload file to cloud storage
            this.logger.log('start uploading file')
            const key = `gml/${randomUUID()}${getExt(createDto.file?.originalname)}`
            const stream = fs.createReadStream(createDto.file.path);
            uploadedFile = await this.storageService.uploadFile(
                key,
                stream,
                createDto.file?.mimetype,
                createDto.file?.size
            )
            this.logger.log('upload works')

            // save source file data to the database
            sourceFile = await queryRunner.manager.save(
                SourceFile,
                {
                    filename: createDto.file?.originalname,
                    uploadedBy: createDto.uploadedBy,
                    asset: { id: createDto.assetId },
                    url: uploadedFile.url
                } as SourceFile
            );

            // Adding attributes to the gml
            const addAttributeParams: AddAttributeToGML = {
                assetId: createDto.assetId,
                sourceFileId: sourceFile.id,
                filepath: createDto?.file?.path!,
                validFrom: createDto.validFrom,
                validTo: createDto.validTo
            }
            outputPath = await this.gmlService.addAttributeToGml(addAttributeParams)

            // import data to the database
            const importParams: ImportFileOptions = {
                inputFile: outputPath,
                importer: createDto.uploadedBy.fullname,
                importMode: ImportMode.SKIP
            }
            await this.cityDbToolService.importCityGml(importParams)

            // calculate center point of the asset
            const point = await this.cityDbQueryService.getAssetCenterPoint(createDto.assetId);
            if (point?.location) {
                await queryRunner.manager.query(`
                    UPDATE "public"."assets"
                    SET location = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
                    WHERE "id" = $2
                `, [point.location, createDto.assetId])
            }

            // commit transaction
            await queryRunner.commitTransaction();

            await this.invalidateAssetCaches(createDto.assetId);
            return {
                message: "Successfully imported the file",
                data: sourceFile
            };
        } catch (err) {
            this.logger.error(err);

            if (uploadedFile?.url) {
                const prefix = getPrefix(uploadedFile.url, false);
                await this.storageService.deleteFile(prefix);
            }

            if (sourceFile) {
                try {
                    const feature = await this.cityDbQueryService.findFeatureByFileId(
                        createDto.assetId,
                        sourceFile?.id
                    )
                    if (feature?.id) {
                        // Remove imported data
                        await this.cityDbToolService.remove({
                            assetId: createDto.assetId,
                            sourceFileId: sourceFile?.id
                        });
                    }
                } catch (err) { this.logger.error(err); }
            }

            // rollback
            await queryRunner.rollbackTransaction();

            throw new InternalServerErrorException(`Failed to process GML file`)
        } finally {
            // release the query runner
            await queryRunner.release();

            // Safely remove temporary files
            this.logger.log('Remove temporary files')
            const cleanupFiles = [outputPath, createDto.file?.path];
            await this.cleanUpFiles(cleanupFiles);
        }
    }

    async update(
        updateDto: UpdateSourceFileDto,
        assetId: string,
        sourceFileId: string
    ): Promise<SourceFile> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let outputPath: string | null = null;
        let updatedSrcFile: SourceFile | undefined;

        try {
            const srcFile = await queryRunner.manager.findOne(
                SourceFile,
                {
                    where: {
                        id: sourceFileId,
                        asset: { id: assetId }
                    }
                }
            );
            if (!srcFile) throw new NotFoundException('Source File Not Found');

            // update source file data
            srcFile.filename = file.originalname;
            srcFile.uploadedBy = updateDto?.uploadedBy;
            updatedSrcFile = await queryRunner.manager.save(SourceFile, srcFile);

            // Add 'asset id' and 'source file id' to gml data
            const addAttributeParams: AddAttributeToGML = {
                assetId: assetId,
                sourceFileId: srcFile.id,
                filepath: file.path,
                validFrom: updateDto.validFrom,
                validTo: updateDto.validTo,
            }
            outputPath = await this.gmlService.addAttributeToGml(addAttributeParams)

            // import data to the database
            const importParams: ImportFileOptions = {
                inputFile: outputPath,
                importer: updateDto?.uploadedBy?.fullname,
                importMode: ImportMode.TERMINATE
            }
            await this.cityDbToolService.importCityGml(importParams)

            // calculate center point of the asset
            const point = await this.cityDbQueryService.getAssetCenterPoint(assetId);
            if (point?.location) {
                await queryRunner.manager.query(`
                    UPDATE "public"."assets"
                    SET location = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)
                    WHERE "id" = $2
                `, [point.location, assetId])
            }
            // commit transaction
            await queryRunner.commitTransaction();

            await this.invalidateAssetCaches(assetId);
            return updatedSrcFile!;

        } catch (err) {
            this.logger.error(err);
            await queryRunner.rollbackTransaction();

            if (err instanceof NotFoundException) {
                throw err;
            }

            throw new InternalServerErrorException(`Failed to process GML file`)
        } finally {
            // release the query runner
            await queryRunner.release();

            this.logger.log('Remove temporary files')
            const cleanupFiles = [outputPath, file.path];
            await this.cleanUpFiles(cleanupFiles);
        }
    }

    async findByAssetId(assetId: string) {
        try {
            const key = await this.cacheService.generateKey('assets', assetId);
            const cached = await this.cacheService.get<SourceFile[]>(key);
            if (cached) return cached;
            // make sure that the asset exist
            await this.assetService.findOne(assetId);
            const res = await this.sourceFileRepository.find({
                where: {
                    asset: { id: assetId }
                }
            })
            await this.cacheService.set(key, res);
    
            return res
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException(`Failed to fetch source files by asset id : ${assetId}`)
        }
    }

    async removeByAssetId(assetId: string) {
        try {
            const asset = await this.assetService.findOne(assetId);

            await this.cityDbToolService.remove({ assetId });
            await this.sourceFileRepository.delete({ asset: { id: asset.id } });
            await this.invalidateAssetCaches(assetId);

            return { message: 'Successfully removed features' }
        } catch (err) {
            this.logger.error(err);
            if (err instanceof NotFoundException) {
                throw err;
            }

            throw new InternalServerErrorException('Failed to remove source file data')
        }
    }

    async remove(assetId: string, fileId: string) {
        try {
            const sourceFile = await this.sourceFileRepository.findOne({
                where: {
                    id: fileId,
                    asset: { id: assetId }
                }
            });
            if (!sourceFile) {
                throw new NotFoundException('Source File Not Found');
            }

            await this.cityDbToolService.remove({ assetId, sourceFileId: fileId });
            await this.sourceFileRepository.remove(sourceFile);
            await this.invalidateAssetCaches(assetId);

            return { message: 'Successfully removed features' }
        } catch (err) {
            this.logger.error(err);
            if (err instanceof NotFoundException) {
                throw err;
            }

            throw new InternalServerErrorException('Failed to remove source file data')
        }
    }

    async cleanUpFiles(filepaths: (string | null | undefined)[]) {
        for (const filepath of filepaths) {
            if (!filepath) continue;
            try {
                await fs.promises.unlink(filepath);
            } catch (unlinkErr) {
                this.logger.error(unlinkErr);
                const error = unlinkErr as NodeJS.ErrnoException;

                // Ignore errors if the file is already gone
                if (error.code !== 'ENOENT') {
                    console.error(`Failed to delete temp file ${filepath}`)
                }
            }
        }
    }

    private async invalidateAssetCaches(assetId: string) {
        const key = await this.cacheService.generateKey('assets', assetId);
        await this.cacheService.del(key);
        await this.cacheService.delByPattern('assets:list:*');
    }
}
