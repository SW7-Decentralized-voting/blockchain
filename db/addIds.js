import Constituency from '../schemas/Constituency.js';
import NominationDistrict from '../schemas/NominationDistrict.js';
import Party from '../schemas/Party.js';

/**
 * Maps districts to their respective constituencies by finding the ObjectId of the constituency
 * @param {Array<DistrictMock>} districts An array of districts to map to their respective constituencies
 * @returns {Promise<Array<DistrictMockId>>} An array of districts with their respective constituencies mapped to their ObjectIds
 */
export async function districtsWithIds(districts) {
	return await Promise.all(
		districts.map(async district => {
			const constituency = await Constituency.findOne({ name: district.constituency });

			return {
				...district,
				constituency: constituency._id,  // Map the ObjectId of the found constituency
			};
		})
	);
}

/**
 * Maps candidates to their respective parties and nominationDistricts by finding the ObjectId of the party and nominationDistrict
 * @param {Array<CandidateMock>} candidates An array of candidates to map to their respective parties and nominationDistricts
 * @returns {Promise<Array<CandidateMockId>>} An array of candidates with their respective parties and nominationDistricts mapped to their ObjectIds
 */
export async function candidateWithIds(candidates) {
	return await Promise.all(
		candidates.map(async candidate => {
			const party = await Party.findOne({ name: candidate.party });
			const nominationDistrict = await NominationDistrict.findOne({ name: candidate.nominationDistrict });

			return {
				...candidate,
				party: party._id,
				nominationDistrict: nominationDistrict._id,
			};
		}));
}

/**
 * Maps pollingStations to their respective nominationDistricts by finding the ObjectId of the nominationDistrict
 * @param {Array<PollingStationMock>} pollingStations An array of pollingStations to map to their respective nominationDistricts
 * @returns {Promise<Array<PollingStationMockId>>} An array of pollingStations with their respective nominationDistricts mapped to their ObjectIds
 */
export async function pollingStationWithIds(pollingStations) {
	return await Promise.all(
		pollingStations.map(async pollingStation => {
			const district = await NominationDistrict.findOne({ name: pollingStation.nominationDistrict });
			return {
				...pollingStation,
				nominationDistrict: district._id,
			};
		}));
}

/**
 * @import { ObjectId } from 'mongoose';
 * @typedef {object} DistrictMock
 * @property {string} name The name of the district
 * @property {string} constituency The name of the constituency the district belongs to
 */

/**
 * @typedef {object} DistrictMockId
 * @property {string} name The name of the district
 * @property {ObjectId} constituency The ObjectId of the constituency the district belongs to
 */

/**
 * @typedef {object} CandidateMock
 * @property {string} name The name of the candidate
 * @property {string} party The name of the party the candidate is a member of
 * @property {string} nominationDistrict The name of the nomination district the candidate is running in
 */

/**
 * @typedef {object} CandidateMockId
 * @property {string} name The name of the candidate
 * @property {ObjectId} party The ObjectId of the party the candidate is a member of
 * @property {ObjectId} nominationDistrict The ObjectId of the nomination district the candidate is running in
 */

/**
 * @typedef {object} PollingStationMock
 * @property {string} name The name of the polling station
 * @property {string} nominationDistrict The name of the nomination district the polling station belongs to
 */

/**
 * @typedef {object} PollingStationMockId
 * @property {string} name The name of the polling station
 * @property {ObjectId} nominationDistrict The ObjectId of the nomination district the polling station belongs to
 */