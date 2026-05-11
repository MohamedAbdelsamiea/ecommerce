const requiredEnvVars = ["DATABASE_URL"] as const;

export function validateEnv() {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Runtime uses DATABASE_URL (pooler). Prisma CLI uses DIRECT_URL (direct).
export const databaseUrl = process.env.DATABASE_URL!;
export const directUrl = process.env.DIRECT_URL!;

