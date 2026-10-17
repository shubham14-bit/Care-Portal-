import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { createSchemaSql } from './schema.js';
import { seedData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'careportal.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for optimal performance and relational integrity
try {
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('Notice: PRAGMA foreign_keys error:', e.message);
}

// Initialize schema
db.exec(createSchemaSql);

// Seed if first time
seedData(db);

export default db;
