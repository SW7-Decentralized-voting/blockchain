import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { publishCandidate } from '../../controllers/candidate.js';

let router;
const baseRoute = '/candidates';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/candidateRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('GET /candidates with no election in progress', () => {
    test('It should respond with the error code 400', async () => {
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });
});

describe('GET /candidates with an election in progress but no candidates', () => {
    test('It should respond with 200', async () => {
        await startContract();
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });
});

describe('GET /candidates with an election in progress and one candidate added', () => {
    test('It should respond with 200', async () => {
        await startContract();
        await publishCandidate('Candidate 1', 'Party 1');
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([['0', 'Candidate 1', 'Party 1', '0']]);
    });
});