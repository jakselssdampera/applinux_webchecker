import initSqlJs from 'sql.js';
import { readFileSync } from 'node:fs';

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(readFileSync('data/websec.db'));
  
  const scans = db.exec('SELECT * FROM scans');
  console.log('Scans:', JSON.stringify(scans, null, 2));
  
  const results = db.exec('SELECT * FROM scan_results');
  console.log('Results:', JSON.stringify(results, null, 2));
}

main().catch(console.error);
