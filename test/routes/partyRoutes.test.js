import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { ABI, ABIBytecode, accounts } from '../../utils/constants.js';
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

describe('GET /party with no election in progress', () => {
    test('It should respond with the error code 400', async () => {
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });
});

describe('GET /party with an election in progress but no parties', () => {
    test('It should respond with 200', async () => {
        await startContract(ABI, ABIBytecode, accounts.citizen1);
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });
});

describe('GET /party with an election in progress and one party added', () => {
    test('It should respond with 200', async () => {
        await startContract(ABI, ABIBytecode, accounts.citizen1);
        await publishParty('Party 1');
        const response = await request(server).get(baseRoute);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([['0', 'Party 1', '0']]);
    });
});