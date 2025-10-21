import { Pool, neonConfig, type PoolConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function initDb() {
  if (_db) return _db;
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  };
  
  _pool = new Pool(poolConfig);
  _db = drizzle({ client: _pool, schema });
  
  return _db;
}

export function getDb() {
  if (!_db) {
    return initDb();
  }
  return _db;
}

// Lazy getters for backward compatibility
export const pool = new Proxy({} as Pool, {
  get(_target, prop) {
    if (!_pool) initDb();
    return (_pool as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (!_db) initDb();
    return (_db as any)[prop];
  }
});
