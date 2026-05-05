import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/common/services.constant';
@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject(REDIS_CLIENT) private redis: Redis,
    ) { }

    // Ubah default TTL ke 600.000 ms (10 menit)
    async set(key: string, value: any, ttl: number = 600000) {
        await this.cacheManager.set(key, value, ttl);
    }

    async get<T>(key: string): Promise<T | undefined> {
        return await this.cacheManager.get<T>(key);
    }

    async del(key: string) {
        await this.cacheManager.del(key);
    }

    async reset() {
        await this.cacheManager.clear();
    }

    async generateKey(prefix: string, ...args: (string | number)[]): Promise<string> {
        return `${prefix}:${args.join(':')}`;
    }

    generateQueryHash(query: any): string {
        const queryString = JSON.stringify(query);
        return crypto
            .createHash('md5')
            .update(queryString)
            .digest('hex')
            .substring(0, 8);
    }

    async delByPattern(pattern: string) {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await this.redis.scan(
                cursor, 'MATCH', pattern, 'COUNT', 100
            );
            cursor = nextCursor;
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } while (cursor !== '0');
    }

    async safeDelByPattern(pattern: string) {
        try {
            await this.delByPattern(pattern);
        } catch (error) {
            this.logger.warn(error, `Failed to delete cache with pattern ${pattern}`);
        }
    }

}