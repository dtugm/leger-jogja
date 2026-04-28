import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/common/services.constant';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST')
        const port = configService.get<number>('REDIS_PORT')
        const password = configService.get<string>('REDIS_PASSWORD')

        const redisUrl = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;
        return {
          stores: [
            new KeyvRedis(redisUrl),
          ],
        };
      },
    }),
  ],
  providers: [
    CacheService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD')
        });
      },
    },
  ],
  exports: [CacheService, REDIS_CLIENT],
})
export class CacheModule { }

