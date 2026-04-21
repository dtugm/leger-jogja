import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheckService, 
  TypeOrmHealthIndicator, 
  HealthCheck,
  MicroserviceHealthIndicator
} from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private readonly configService: ConfigService
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 300 }),
      () => this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: {
          host: this.configService.get('redis.host'),
          port: this.configService.get('redis.port'),
          password: this.configService.get('redis.password')
        },
      }),
    ]);
  }
}