import auth from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import keys from '../../config/keys.js';

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
		jest.replaceProperty(keys, 'jwtSecret', 'jwtSecret');
		const decodedToken = { id: 'userId' };
		req.headers['authorization'] = 'validToken';
		jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);

		auth(req, res, next);

		expect(jwt.verify).toHaveBeenCalledWith('validToken', 'jwtSecret');
		expect(req.user).toEqual(decodedToken);
		expect(next).toHaveBeenCalled();
	});
});