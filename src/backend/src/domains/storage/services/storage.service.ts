import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    _Object,
    CommonPrefix,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AccessType } from '../enums/access-type.enum';
import { ReadStream } from 'fs';
import { Upload } from '@aws-sdk/lib-storage';

export interface StorageFile {
    key: string;
    size?: number;
    lastModified?: Date;
    contentType?: string;
}

export interface StorageFolder {
    prefix: string;
    name: string;
}

@Injectable()
export class StorageService {
    private readonly client: S3Client;
    private readonly bucketName: string;
    constructor(private readonly configService: ConfigService) {
        const endpoint = this.configService.getOrThrow<string>('storage.endpoint');
        const accessKeyId = this.configService.getOrThrow<string>('storage.accessKeyId');
        const secretAccessKey = this.configService.getOrThrow<string>('storage.secretAccessKey');
        const bucketName = this.configService.getOrThrow<string>('storage.bucketName');

        this.client = new S3Client({
            region: 'auto',
            endpoint: endpoint,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        });
        this.bucketName = bucketName;
    }

    async listFiles(
        prefix: string = '',
        delimiter: string | null = '/',
    ): Promise<{ files: StorageFile[]; folders: StorageFolder[] }> {
        const response = await this.client.send(
            new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                ...(delimiter && { Delimiter: delimiter }),
            }),
        );

        const files: StorageFile[] = (response.Contents || [])
            .filter((item): item is _Object => !!item && !!item.Key)
            .map((item) => ({
                key: item.Key!,
                size: item.Size,
                lastModified: item.LastModified,
            }));

        const folders: StorageFolder[] = (response.CommonPrefixes || [])
            .filter((prefix): prefix is CommonPrefix => !!prefix && !!prefix.Prefix)
            .map((prefix) => ({
                prefix: prefix.Prefix!,
                name: prefix.Prefix!.split('/').slice(-2)[0] || '',
            }));

        return { files, folders };
    }

    async isFileExist(fileKey: string) {
        try {
            await this.client.send(
                new HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileKey,
                }),
            );
            return true;
        } catch (error: any) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }

    }

    async getPresignedUrl(accessType: AccessType, key: string, contentType: string = '', expiresIn: number = 3600) {
        let presignedUrl: string = '';
        if (accessType == AccessType.GET) {
            const fileExist = await this.isFileExist(key);
            if (!fileExist) {
                throw new BadRequestException('File not exist')
            }

            presignedUrl = await getSignedUrl(
                this.client,
                new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
                { expiresIn }
            )
        } else if (accessType == AccessType.POST) {
            presignedUrl = await getSignedUrl(
                this.client,
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    ContentType: contentType
                }),
                { expiresIn }
            )
        }
        return presignedUrl;
    }

    async uploadFile(key: string, file: Buffer | ReadStream, mimetype: string, contentLength?: number) {
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucketName,
                Key: key,
                Body: file,
                ContentLength: contentLength,
                ContentType: mimetype
            },
        });

        const result = await upload.done();

        return {
            key,
            contentType: mimetype,
            url: result.Location
        }
    }

    async getFile(key: string) {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        })

        const response = await this.client.send(command)

        if (!response.Body) {
            throw new InternalServerErrorException('Failed to get file from R2');
        }

        return Buffer.from(await response.Body.transformToByteArray());

        // return await response.Body?.transformToString();
    }

    async deleteFile(key: string) {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            })
        );
    }
    
    async deleteFolder(prefix: string): Promise<void> {
        const { files } = await this.listFiles(prefix, null);

        await Promise.all([
            ...files.map((file) => this.deleteFile(file.key)),
            this.deleteFile(prefix),
        ]);
    }
}
