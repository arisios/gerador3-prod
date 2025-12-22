import mysql from 'mysql2/promise';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Exportando dados do banco...');

const tables = [
  'users', 'projects', 'influencers', 'influencerContents', 
  'influencerProducts', 'trends', 'virals'
];

let sqlDump = `-- Backup do banco de dados Creative Loop - ${new Date().toISOString()}\n`;
sqlDump += `-- GitHub: https://github.com/arisios/loopv3\n\n`;

for (const table of tables) {
  try {
    const [rows] = await connection.query(`SELECT * FROM ${table}`);
    if (rows.length > 0) {
      sqlDump += `\n-- ============================================\n`;
      sqlDump += `-- Tabela: ${table} (${rows.length} registros)\n`;
      sqlDump += `-- ============================================\n\n`;
      
      for (const row of rows) {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'string') return `'${v.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
          if (v instanceof Date) return `'${v.toISOString()}'`;
          if (typeof v === 'boolean') return v ? '1' : '0';
          return v;
        }).join(', ');
        sqlDump += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      }
    }
  } catch (e) {
    console.log(`⚠️  Tabela ${table}: ${e.message}`);
  }
}

fs.writeFileSync('./backup/database-backup.sql', sqlDump);
console.log('\n✅ Dados exportados para backup/database-backup.sql');

// Também copiar schema
const schemaContent = fs.readFileSync('./drizzle/schema.ts', 'utf8');
fs.writeFileSync('./backup/schema.ts', schemaContent);
console.log('✅ Schema copiado para backup/schema.ts');

await connection.end();
