import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { startElection } from '../../controllers/election.js';
import { getElection } from '../../utils/electionManager.js';
import { jest } from '@jest/globals';

let router;
const baseRoute = '/vote';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/voteRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('POST /vote', () => {
    test('It should respond with the error code 400 when no contract is deployed', async () => {
        const response = await request(server)
            .post(baseRoute)
            .send({ encryptedVote: '0x1234567890abcdef' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });

    test('It should respond with 400 when the election is not in the voting phase', async () => {
        await startContract();
        const response = await request(server)
            .post(baseRoute)
            .send({ encryptedVote: '0x1234567890abcdef' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election is not in the voting phase' });
    });

    test('It should respond with 200 when the election is in the voting phase', async () => {
        await startContract();
        await getElection().startVotingPhase();
        const response = await request(server)
            .post(baseRoute)
            .send({ encryptedVote: '0x1234567890abcdef' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Vote cast successfully', transactionHash: expect.any(String) });
    });
}
);

describe('GET /vote/encryption-key', () => {
    test('It should respond with the error code 400 when no contract is deployed', async () => {
        const response = await request(server).get(`${baseRoute}/encryption-key`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });

    test('It should respond with 200 when an election contract is deployed', async () => {
        const body = {
            'candidates': [
                { 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { 'name': 'democrats' }
            ]
        };
        await startElection({ body }, { status: jest.fn() }, jest.fn());

        const response = await request(server).get(`${baseRoute}/encryption-key`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(String));
    });
}
);