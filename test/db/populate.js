import Candidate from '../../schemas/Candidate.js';
import Constituency from '../../schemas/Constituency.js';
import NominationDistrict from '../../schemas/NominationDistrict.js';
import Party from '../../schemas/Party.js';
import Key from '../../schemas/Key.js';
import PollingStation from '../../schemas/PollingStation.js';
import { candidateWithIds, districtsWithIds, pollingStationWithIds } from '../../db/addIds.js';
import mockdata from '../../db/mockdata.js';

/**
 * Populate the database with mock data
 */
export default async function populate() {
	await Constituency.deleteMany();
	await Party.deleteMany();
	await Candidate.deleteMany();
	await NominationDistrict.deleteMany();
	await Key.deleteMany();
	await PollingStation.deleteMany();

	await Constituency.insertMany(mockdata.constituencies);
	await Party.insertMany(mockdata.parties);
	await NominationDistrict.insertMany(await districtsWithIds(mockdata.nominationDistricts));
	await Candidate.insertMany(await candidateWithIds(mockdata.candidates));
	await PollingStation.insertMany(await pollingStationWithIds(mockdata.pollingStations));
}
