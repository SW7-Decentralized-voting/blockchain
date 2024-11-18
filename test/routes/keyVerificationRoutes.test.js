import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import router from '../../routes/keyVerificationRoutes.js'; 
import connectDb from '../setup/connect.js';
import populate from '../db/populate.js';
import PollingStation from '../../schemas/PollingStation.js';
import Key from '../../schemas/Key.js';
import { expect, jest } from '@jest/globals';

const baseRoute = '/api/v1/key';

const app = express();
app.use(express.json());
app.use(baseRoute, router);

const server = app.listen(0);

beforeAll(async () => {
	connectDb();

	await populate();
});

describe('POST /api/v1/key/verify', () => {
	it('should return 200 OK and message with token given a valid key', async () => {
		const keyHash = '123456';
		const pollingStation = await PollingStation.findOne();

		await new Key({
			keyHash: keyHash,
			pollingStation: pollingStation._id,
		}).save();

		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({ key: '123456', pollingStation: pollingStation._id });
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			message: 'Key verified',
			token: expect.stringMatching(/.+\..+\..+/),
		});
	});

	it('should set key to used after verification', async () => {
		const pollingStation = await PollingStation.findOne();
		const key = new Key({
			keyHash: '123456',
			pollingStation: pollingStation._id,
		});
		await key.save();

		expect(key.isUsed).toBe(false);
		await request(app)
			.post(baseRoute + '/verify')
			.send({ key: key.keyHash, pollingStation: key.pollingStation });

		const updatedKey = await Key.findOne({ keyHash: key.keyHash });
		expect(updatedKey.isUsed).toBe(true);
	});

	it('should return 400 Bad Request with missing key and pollingStation', async () => {
		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({});
		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({ message: 'Key and pollingStation are required' });
	});

	it('should return 400 Bad Request if missing pollingStation', async () => {
		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({ key: '123456' });
		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({ message: 'Key and pollingStation are required' });
	});

	it('should return 400 Bad Request if pollingStation is not found', async () => {
		const pollingStationId = new mongoose.Types.ObjectId();
		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({ key: '123456', pollingStation: pollingStationId });
		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({ message: 'Polling station not found: ' + pollingStationId });
	});

	it('should return 400 Bad Request if pollingStation id is invalid', async () => {
		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({ key: '123456', pollingStation: 'invalid' });
		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({ message: 'Invalid id: ' + 'invalid' });
	});

	it('should return 401 Unauthorized with invalid key', async () => {
		const pollingStation = await PollingStation.findOne();

		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({ key: 'invalid', pollingStation: pollingStation._id });
		expect(response.statusCode).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid key' });
	});

	it('should return 500 Internal Server Error if an uncaught error happens', async () => {
		jest.spyOn(PollingStation, 'findOne').mockImplementationOnce(() => {
			throw new Error('Uncaught error');
		});
		jest.spyOn(console, 'error').mockImplementationOnce(() => { });
		const response = await request(app)
			.post(baseRoute + '/verify')
			.send({ key: '123456', pollingStation: 'invalid' });
		expect(response.statusCode).toBe(500);
		expect(response.body).toEqual({ message: 'Error verifying key' });
	});
});

afterAll(async () => {
	await mongoose.connection.close();
	server.close();
});