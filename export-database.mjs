import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

console.log('📊 Exportando banco de dados...\n');

// Listar todas as tabelas
const [tables] = await connection.query(`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = DATABASE()
`);

const exportData = {
  exportDate: new Date().toISOString(),
  tables: {}
};

for (const { table_name } of tables) {
  console.log(`  Exportando tabela: ${table_name}`);
  const [rows] = await connection.query(`SELECT * FROM \`${table_name}\``);
  exportData.tables[table_name] = {
    rowCount: rows.length,
    data: rows
  };
}

// Salvar em JSON
const jsonPath = '/home/ubuntu/gerador3/backups/database-export.json';
fs.writeFileSync(jsonPath, JSON.stringify(exportData, null, 2));

console.log(`\n✅ Export completo salvo em: ${jsonPath}`);
console.log(`\n📈 Estatísticas:`);
Object.entries(exportData.tables).forEach(([name, { rowCount }]) => {
  console.log(`  - ${name}: ${rowCount} registros`);
});

await connection.end();
