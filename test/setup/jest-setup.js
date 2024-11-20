/**
 *   Sets up a connection to an in-memory mongo database for fast and isolated testing
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { join } from 'path';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const globalConfigPath = join(__dirname, 'globalConfigMongo.json');

const mongod =
global.__MONGOD__ ||
  new MongoMemoryServer({
    autoStart: false,
    useUnifiedTopology: true
  });

export default async () => {
  await mongod.ensureInstance();

  const mongoConfig = {
  mongoDBName: 'jest',
  mongoUri: mongod.getUri()
};

  // Write global config to disk because all tests run in different contexts.
  writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));

  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = mongod;
};

const originalEmitWarning = process.emitWarning;

// Suppress specific warnings
process.emitWarning = (warning, ...args) => {
  if (typeof warning === 'string' && warning.includes('VM Modules is an experimental feature')) {
    return;
  }
  // Call the original emitWarning function for other warnings
  originalEmitWarning.call(process, warning, ...args);
};