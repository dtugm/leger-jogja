import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogActivityInterceptor } from './common/interceptors/log-activity.interceptor';
import { CitydbToolModule } from './domains/citydb-tool/citydb-tool.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './db/database.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { UsersModule } from './domains/users/users.module';
import { AuthModule } from './domains/auth/auth.module';
import { MenusModule } from './domains/menus/menus.module';
import { HealthModule } from './domains/health/health.module';
import { AssetModule } from './domains/asset/asset.module';
import { CacheModule } from './cache/cache.module';
import { ToolModule } from './tool/tool.module';
import { StorageModule } from './domains/storage/storage.module';
import { Tiles3dModule } from './domains/tiles3d/tiles3d.module';
import { LogActivityModule } from './domains/log-activity/log-activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100, // Maximum number of requests within the ttl
        },
      ],
    }),
    CacheModule,
    HealthModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    CitydbToolModule,
    MenusModule,
    AssetModule,
    ToolModule,
    StorageModule,
    Tiles3dModule,
    LogActivityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LogActivityInterceptor,
    },
  ],
})
export class AppModule {}
