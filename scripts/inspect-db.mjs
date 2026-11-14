
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { readConfig } from '../backend/config.mjs';

const config = readConfig();

for (const filename of ['sales.sqlite', 'auth.sqlite']) {
  const file = path.join(config.dataDir, filename);
  const db = new DatabaseSync(file, { readOnly: true });

  console.log('\nDATABASE:', filename);

  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  for (const { name } of tables) {
    const safeName = '"' + name.replaceAll('"', '""') + '"';
    const result = db.prepare(
      `SELECT COUNT(*) AS total FROM ${safeName}`
    ).get();

    console.log(name + ': ' + result.total + ' records');
  }

  db.close();
}
