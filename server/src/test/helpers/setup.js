import { clearDb, getTmpDbUrl, runTestMigration } from './db.js';

const tmpDbDir = getTmpDbUrl();

await clearDb(tmpDbDir);

await runTestMigration(tmpDbDir);
