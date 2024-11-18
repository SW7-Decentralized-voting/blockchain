import { connectToDb } from './index.js';
// import env MONGO_URI from .env
import keys from '../config/keys.js';

import mockdata from './mockdata.js';

import Candidate from '../schemas/Candidate.js';
import Party from '../schemas/Party.js';
import NominationDistrict from '../schemas/NominationDistrict.js';
import Constituency from '../schemas/Constituency.js';
import PollingStation from '../schemas/PollingStation.js';

import { districtsWithIds, candidateWithIds, pollingStationWithIds } from './addIds.js';

/**
 * Populate the database with mock data
 * @param {string} database The database to populate
 * @param {boolean} clear Clear the database before populating
 */
export default async function populateDb(database, clear) {

	const db = connectToDb(keys.mongoURI.toString().replace('/?', '/' + database + '?'));

	// Test connection
	db.once('open', () => {
		// eslint-disable-next-line no-console
		console.log('Connected to MongoDB');
	});

	// Clear the database if argument 'clear' is passed
	if (clear) {
		// eslint-disable-next-line no-console
		console.log('Clearing database...');
		await Candidate.deleteMany();
		await Party.deleteMany();
		await NominationDistrict.deleteMany();
		await Constituency.deleteMany();
		await PollingStation.deleteMany();
	}
	await Candidate.syncIndexes();
	await Party.syncIndexes();
	await NominationDistrict.syncIndexes();
	await Constituency.syncIndexes();
	await PollingStation.syncIndexes();

	await Party.insertMany(mockdata.parties);
	await Constituency.insertMany(mockdata.constituencies);
	await NominationDistrict.insertMany(await districtsWithIds(mockdata.nominationDistricts));
	await Candidate.insertMany(await candidateWithIds(mockdata.candidates));
	await PollingStation.insertMany(await pollingStationWithIds(mockdata.pollingStations));

	const party1 = await Party.findOne({ name: 'Nordlisten' });

	const candidatesInParty1 = await Candidate.find({ party: party1._id });
	// eslint-disable-next-line no-console
	console.log('Candidates in', party1.name, ':\n ', candidatesInParty1.map(candidate => candidate.name).join('\n  '));

	db.close();
}