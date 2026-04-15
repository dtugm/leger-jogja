if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error("[ENV] Missing required environment variable: NEXT_PUBLIC_API_BASE_URL");
}

if (!process.env.NEXT_PUBLIC_TOKEN_ENCRYPTION_KEY) {
  throw new Error("[ENV] Missing required environment variable: NEXT_PUBLIC_TOKEN_ENCRYPTION_KEY");
}

export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  TOKEN_ENCRYPTION_KEY: process.env.NEXT_PUBLIC_TOKEN_ENCRYPTION_KEY,
} as const;
