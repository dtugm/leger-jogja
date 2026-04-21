import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from '../entities/asset.entity';
import { Repository } from 'typeorm';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { PagedResponseDto } from 'src/common/dto/paged-response.dto';
import { QueryAssetDto } from '../dto/query-asset.dto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class AssetService {
    constructor(
        @InjectRepository(Asset)
        private readonly assetRepository: Repository<Asset>,
        private readonly cacheService: CacheService
    ) { }

    async create(assetData: CreateAssetDto) {
        const asset = await this.assetRepository
            .createQueryBuilder('asset')
            .insert()
            .values({
                name: assetData.name,
                description: assetData.description,
                location: () => `ST_GeomFromGeoJSON(:locationData)`
            })
            .setParameter('locationData', assetData.location)
            .execute();
        
        // clear cache related to asset list
        await this.cacheService.delByPattern('assets:list:*'); 

        return await this.findOne(asset.identifiers[0].id);
    }

    async findOne(id: string): Promise<Asset> {
        const asset = await this.assetRepository.findOneBy({ id });
        if (!asset) {
            throw new NotFoundException(`Asset with id ${id} not found`);
        }

        return asset;
    }

    async findAll(query: QueryAssetDto): Promise<PagedResponseDto<Asset>> {
        // cache
        const key = await this.cacheService.generateKey(
            'assets', 'list',
            this.cacheService.generateQueryHash(query)
        );
        const cached = await this.cacheService.get<PagedResponseDto<Asset>>(key);
        if (cached) return cached;
        
        console.log('Cache miss for key:', key);

        const qb = this.assetRepository
            .createQueryBuilder('asset')
            .orderBy('created_at', 'DESC')

        if (query.name) {
            qb.where('name ILIKE :name', { name: `%${query.name}%` })
        }

        // pagination
        const skip = (query.page - 1) * query.limit;
        qb.skip(skip).take(query.limit);

        const [result, total] = await qb.getManyAndCount();

        const response: PagedResponseDto<Asset> = {
            result,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
            metadata: {
                searchableFields: ['name']
            }
        }

        // cache response for 10 minutes
        await this.cacheService.set(key, response);

        return response;
    }
}
