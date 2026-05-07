export class CreateLogActivityDto {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  endpoint: string;
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  payload?: Record<string, any> | null;
  responseTime?: number;
}
