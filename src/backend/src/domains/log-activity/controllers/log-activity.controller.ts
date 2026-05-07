import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/domains/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/domains/auth/guards/roles.guard';
import { Roles } from 'src/domains/auth/decorators/roles.decorator';
import { UserRole } from 'src/domains/users/entities/user.entity';
import { LogActivityService } from '../services/log-activity.service';
import { QueryLogActivityDto } from '../dto/query-log-activity.dto';
import { SkipLogActivity } from 'src/common/decorators/skip-log-activity.decorator';

@ApiTags('Log Activity')
@ApiBearerAuth()
@Controller('log-activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
@SkipLogActivity()
export class LogActivityController {
  constructor(private readonly logActivityService: LogActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all activity logs with filters' })
  findAll(@Query() query: QueryLogActivityDto) {
    return this.logActivityService.findAll(query);
  }
}
