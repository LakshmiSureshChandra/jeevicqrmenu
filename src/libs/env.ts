import z, { ZodTypeAny } from 'zod';
import type { TEnvKey } from './types';

type EnvRecords = Record<TEnvKey, ZodTypeAny>;

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:4545'),
} satisfies EnvRecords);

export const env = envSchema.parse(import.meta.env);
export type Env = z.infer<typeof envSchema>;