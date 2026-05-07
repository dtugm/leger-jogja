import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogActivity } from '../entities/log-activity.entity';
import { CreateLogActivityDto } from '../dto/create-log-activity.dto';
import { QueryLogActivityDto } from '../dto/query-log-activity.dto';
import { PagedResponseDto } from 'src/common/dto/paged-response.dto';

@Injectable()
export class LogActivityService {
  private readonly logger = new Logger(LogActivityService.name);

  constructor(
    @InjectRepository(LogActivity)
    private readonly logActivityRepository: Repository<LogActivity>,
  ) {}

  log(data: CreateLogActivityDto): void {
    this.logActivityRepository.save({
      ...data,
      payload: data.payload ?? undefined,
    }).catch((err) => this.logger.error('Failed to save log activity', err));
  }

  async findAll(query: QueryLogActivityDto): Promise<PagedResponseDto<LogActivity>> {
    try {
      const qb = this.logActivityRepository
        .createQueryBuilder('log')
        .leftJoinAndSelect('log.user', 'user')
        .orderBy('log.createdAt', 'DESC');

      if (query.userId) qb.andWhere('log.user_id = :userId', { userId: query.userId });
      if (query.resource) qb.andWhere('log.resource ILIKE :resource', { resource: `%${query.resource}%` });
      if (query.action) qb.andWhere('log.action = :action', { action: query.action });
      if (query.method) qb.andWhere('log.method = :method', { method: query.method.toUpperCase() });
      if (query.statusCode) qb.andWhere('log.status_code = :statusCode', { statusCode: query.statusCode });
      if (query.dateFrom) qb.andWhere('log.created_at >= :dateFrom', { dateFrom: query.dateFrom });
      if (query.dateTo) qb.andWhere('log.created_at <= :dateTo', { dateTo: query.dateTo });

      const skip = (query.page - 1) * query.limit;
      qb.skip(skip).take(query.limit);

      const [result, total] = await qb.getManyAndCount();

      return {
        result,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
        metadata: {
          filterableFields: ['userId', 'resource', 'action', 'method', 'statusCode', 'dateFrom', 'dateTo'],
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to fetch log activities');
    }
  }
}
