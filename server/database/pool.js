import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ensure .env is loaded even when process is started from /server directory
const rootEnvPath = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const { Pool } = pg;

// Extract connection details from DATABASE_URL or use individual env vars
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    console.log('ℹ️  Using DATABASE_URL from environment');
    // Ensure SSL is enabled for production databases
    let connectionString = process.env.DATABASE_URL;
    
    // Fix connection string if password contains special characters or brackets
    if (connectionString.includes('[') && connectionString.includes(']')) {
      // Extract password from brackets and URL encode it
      const match = connectionString.match(/:(.+?)@/);
      if (match && match[1]) {
        const password = match[1].replace(/[\[\]]/g, ''); // Remove brackets
        const encodedPassword = encodeURIComponent(password);
        connectionString = connectionString.replace(/:(.+?)@/, `:${encodedPassword}@`);
        console.log('ℹ️  Fixed password encoding in DATABASE_URL');
      }
    }
    
    // Determine SSL requirement based on connection string
    const requiresSSL = connectionString.includes('neon.tech') || 
                       connectionString.includes('amazonaws.com') ||
                       process.env.NODE_ENV === 'production';
    
    return {
      connectionString,
      ssl: requiresSSL ? { rejectUnauthorized: false } : false
    };
  }

  // Fallback to individual env vars
  if (process.env.DB_HOST && process.env.DB_PASSWORD) {
    return {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }
  
  // If no credentials, log warning
  console.error('❌ Missing database credentials!');
  console.error('   Set DATABASE_URL or DB_* variables in .env file');
  console.error('   DATABASE_URL format: postgresql://user:password@host:port/database');
  
  // Return a minimal config that will fail gracefully
  return {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'missing',
    ssl: false
  };
};

const pool = new Pool(getDatabaseConfig());

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
});

// Export pool for use in routes and data layers
export default pool;
