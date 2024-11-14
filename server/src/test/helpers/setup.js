import { getTmpDbUrl, runTestMigration } from "./db.js";

const tmpDbDir = getTmpDbUrl()

await runTestMigration(tmpDbDir);

globalThis.tmpDbDir = tmpDbDir;
