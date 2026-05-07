import { SetMetadata } from '@nestjs/common';

export const SKIP_LOG_ACTIVITY_KEY = 'skipLogActivity';
export const SkipLogActivity = () => SetMetadata(SKIP_LOG_ACTIVITY_KEY, true);
