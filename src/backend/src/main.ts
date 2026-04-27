import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { createLogger } from 'winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
 
async function bootstrap() {
  const appName = process.env.APP_NAME || 'Nest'
  const level = process.env.LOG_LEVEL || 'error'
  const loggerInstance = createLogger({
    level,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.errors(),
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike(appName, {
            colors: true,
            prettyPrint: true,
            processId: true,
            appName: true
          })
        )
      })
    ]
  })

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance: loggerInstance })
  });

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('Legger Jogja API')
    .setDescription('API untuk Legger Jogja')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste accessToken returned by /auth/login',
      },
      'bearer',
    )
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
