export interface Configuration {
  port: number;
  nodeEnv: string;
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;
  };
  mail: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  passwordReset: {
    frontendUrl: string;
    tokenExpiresInMinutes: number;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    srid: string;
    srsName: string;
    schema: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    ttl: number;
  };
  storage: {
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint: string;
    publicDomain: string;
  }
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvAsIntOrThrow(key: string): number {
  const value = getEnvOrThrow(key);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} must be a valid number, got: ${value}`,
    );
  }
  return parsed;
}

function getEnvAsBoolOrThrow(key: string): boolean {
  const value = getEnvOrThrow(key).toLowerCase();

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(
    `Environment variable ${key} must be either "true" or "false", got: ${value}`,
  );
}

function validateConfiguration(): void {
  const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES_IN',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_SECURE',
    'MAIL_USER',
    'MAIL_PASS',
    'MAIL_FROM',
    'FRONTEND_URL',
    'PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASS',
    'DB_NAME',
    'DB_SRID',
    'DB_SRS_NAME',
    'DB_SCHEMA',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_TTL',
  ];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((key) => `  - ${key}`).join('\n')}`,
    );
  }
}

export default (): Configuration => {
  validateConfiguration();

  return {
    port: getEnvAsIntOrThrow('PORT'),
    nodeEnv: getEnvOrThrow('NODE_ENV'),
    auth: {
      jwtSecret: getEnvOrThrow('JWT_SECRET'),
      jwtExpiresIn: getEnvOrThrow('JWT_EXPIRES_IN'),
      jwtRefreshSecret: getEnvOrThrow('JWT_REFRESH_SECRET'),
      jwtRefreshExpiresIn: getEnvOrThrow('JWT_REFRESH_EXPIRES_IN'),
    },
    mail: {
      host: getEnvOrThrow('MAIL_HOST'),
      port: getEnvAsIntOrThrow('MAIL_PORT'),
      secure: getEnvAsBoolOrThrow('MAIL_SECURE'),
      user: getEnvOrThrow('MAIL_USER'),
      pass: getEnvOrThrow('MAIL_PASS'),
      from: getEnvOrThrow('MAIL_FROM'),
    },
    passwordReset: {
      frontendUrl: getEnvOrThrow('FRONTEND_URL'),
      tokenExpiresInMinutes: getEnvAsIntOrThrow(
        'PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES',
      ),
    },
    database: {
      host: getEnvOrThrow('DB_HOST'),
      port: getEnvAsIntOrThrow('DB_PORT'),
      username: getEnvOrThrow('DB_USER'),
      password: getEnvOrThrow('DB_PASS'),
      name: getEnvOrThrow('DB_NAME'),
      srid: getEnvOrThrow('DB_SRID'),
      srsName: getEnvOrThrow('DB_SRS_NAME'),
      schema: getEnvOrThrow('DB_SCHEMA'),
    },
    redis: {
      host: getEnvOrThrow('REDIS_HOST'),
      port: getEnvAsIntOrThrow('REDIS_PORT'),
      password: process.env.REDIS_PASSWORD || '',
      ttl: getEnvAsIntOrThrow('REDIS_TTL'),
    },
    storage: {
      accessKeyId: getEnvOrThrow('ACCESS_KEY_ID'),
      secretAccessKey: getEnvOrThrow('SECRET_ACCESS_KEY'),
      bucketName: getEnvOrThrow('BUCKET_NAME'),
      endpoint: getEnvOrThrow('ENDPOINT'),
      publicDomain: getEnvOrThrow('PUBLIC_DOMAIN')
    }
  };
};
