import express from 'express';
import auth from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import { beforeAll, jest } from '@jest/globals';
import keys from '../../config/keys';

const app = express();
app.use(express.json());

beforeAll(() => {
	jest.restoreAllMocks();
	jest.unstable_mockModule('jsonwebtoken', () => {
		return {
			verify: jest.fn(),
		};
	});

	
});

describe('auth', () => {
	let req, res, next;

	beforeEach(() => {
		jest.restoreAllMocks();
		req = {
			headers: {}
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
		next = jest.fn();
	});

	it('should return 401 if no token is provided', () => {
		auth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied: No Token Provided' });
	});

	it('should return 401 if token is invalid', () => {
		req.headers['authorization'] = 'invalidToken';
		jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error(); });

		auth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: 'Access Denied: Invalid Token' });
	});

	it('should call next if token is valid', () => {
		const decodedToken = { id: 'userId' };
		req.headers['authorization'] = 'validToken';
		jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);

		auth(req, res, next);

		expect(jwt.verify).toHaveBeenCalledWith('validToken', keys.jwtSecret);
		expect(req.user).toEqual(decodedToken);
		expect(next).toHaveBeenCalled();
	});
});