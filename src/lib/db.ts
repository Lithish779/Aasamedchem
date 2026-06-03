import { neon } from "@neondatabase/serverless";

// Fallback connection string during Next.js build pre-rendering if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@ep-placeholder.region.pooler.neon.tech/placeholder";

const sql = neon(connectionString);

export { sql };

export async function query<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  return sql(strings, ...values) as Promise<T[]>;
}
