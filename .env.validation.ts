import { z } from 'zod';

// Client environment variables schema
export const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url('API URL must be a valid URL'),
  VITE_STRIPE_PUBLIC_KEY: z.string().optional(),
  VITE_EMAILJS_SERVICE_ID: z.string().optional(),
  VITE_EMAILJS_TEMPLATE_ID: z.string().optional(),
  VITE_EMAILJS_PUBLIC_KEY: z.string().optional(),
});

// API environment variables schema
export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/, 'Port must be a number').transform(Number).default('4000'),
  DATABASE_URL: z.string().url('Database URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters for security'),
  CORS_ORIGINS: z.string().min(1, 'CORS origins are required'),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

// Validate environment variables
export function validateEnv<T extends z.ZodSchema>(
  schema: T,
  env: Record<string, string | undefined>
): z.infer<T> {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors.map(err => 
        `  ❌ ${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`\n⚠️  Environment variable validation failed:\n${formatted}\n`);
    }
    throw error;
  }
}

// Type exports
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
