import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.ts';
import { sql } from 'drizzle-orm';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

console.log('Exportando dados do banco...');

// Pegar todas as tabelas
const tables = [
  'users', 'projects', 'influencers', 'influencerContents', 
  'influencerProducts', 'trends', 'virals'
];

let sqlDump = `-- Backup do banco de dados - ${new Date().toISOString()}\n\n`;

for (const table of tables) {
  try {
    const [rows] = await connection.query(`SELECT * FROM ${table}`);
    if (rows.length > 0) {
      sqlDump += `-- Tabela: ${table}\n`;
      for (const row of rows) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => 
          v === null ? 'NULL' : 
          typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` :
          v instanceof Date ? `'${v.toISOString()}'` :
          v
        ).join(', ');
        sqlDump += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      }
      sqlDump += '\n';
    }
  } catch (e) {
    console.log(`Tabela ${table} não existe ou erro:`, e.message);
  }
}

fs.writeFileSync('./backup/data-backup.sql', sqlDump);
console.log('✅ Dados exportados para backup/data-backup.sql');

await connection.end();
