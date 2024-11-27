import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { publishParty } from '../../controllers/party.js';

let router;
const baseRoute = '/parties';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/partyRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('GET /parties', () => {
    test('It should respond with the error code 400 when no contract is deployed', async () => {
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });

    test('It should respond with 200 when an election contract is deployed but no parties', async () => {
        await startContract();
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('It should respond with 200 when an election contract is deployed and one party added', async () => {
        await startContract();
        await publishParty(0, 'Party 1');
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([['0', 'Party 1']]);
    });
});