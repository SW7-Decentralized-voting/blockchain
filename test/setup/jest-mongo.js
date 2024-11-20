/**
	*   Sets up a custom Mongodb Test Environment to be used with Jest
	*/

import { TestEnvironment as NodeEnvironment } from 'jest-environment-node';

import { join } from 'path';

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const globalConfigPath = join(__dirname, 'globalConfigMongo.json');

class MongoEnvironment extends NodeEnvironment {
  
	constructor(config) {
		super(config);
	}

	async setup() {
		const globalConfig = JSON.parse(readFileSync(globalConfigPath, 'utf-8'));

		this.global.__MONGO_URI__ = globalConfig.mongoUri;
		this.global.__MONGO_DB_NAME__ = globalConfig.mongoDBName;

		await super.setup();
	}

	async teardown() {
		await super.teardown();
	}

	runScript(script) {
		return super.runScript(script);
	}
}

export default MongoEnvironment;