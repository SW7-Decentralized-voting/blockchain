import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { ABI, ABIBytecode, accounts } from '../../utils/constants.js';

let router;
const baseRoute = '/election';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/electionRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('POST /election/start with no election contract deployed and no candidates or parties', () => {
    test('It should respond with 200', async () => {
        const body = {
        };
        const response = await request(server).post(baseRoute + '/start').send(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Candidates and parties are required' });
    });
});

describe('POST /election/start with no election contract deployed with candidates and parties', () => {
    test('It should respond with 200', async () => {
        const body = {
            'candidates': [
                { 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { 'name': 'democrats' }
            ]
        };
        const response = await request(server).post(baseRoute + '/start').send(body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Election started successfully' });
    });
});

describe('POST /election/start with an election contract deployed', () => {
    test('It should respond with the error code 400', async () => {
        await startContract(ABI, ABIBytecode, accounts.citizen1);
        const body = {
            'candidates': [
                { 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { 'name': 'democrats' }
            ]
        };
        const response = await request(server).post(baseRoute + '/start').send(body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has already started' });
    });
}
);

describe('POST /election/advance-phase with no election contract deployed', () => {
    test('It should respond with the error code 400', async () => {
        const response = await request(server).post(baseRoute + '/advance-phase');
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });
}
);

describe('POST /election/advance-phase with an election contract deployed and in registration phase', () => {
    test('It should respond with 200', async () => {
        const body = {
            'candidates': [
                { 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { 'name': 'democrats' }
            ]
        };
        await request(server).post(baseRoute + '/start').send(body);
        const response = await request(server).post(baseRoute + '/advance-phase');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Election phase advanced to voting phase', transactionHash: expect.any(String) });
    });
}
);

describe('POST /election/advance-phase with an election contract deployed and in voting phase', () => {
    test('It should respond with 200', async () => {
        const body = {
            'candidates': [
                { 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { 'name': 'democrats' }
            ]
        };
        await request(server).post(baseRoute + '/start').send(body);
        await request(server).post(baseRoute + '/advance-phase');
        const response = await request(server).post(baseRoute + '/advance-phase');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Election phase advanced to tallying phase', transactionHash: expect.any(String) });
    });
}
);

describe('POST /election/advance-phase with an election contract deployed and in tallying phase', () => {
    test('It should respond with the error code 400', async () => {
        const body = {
            'candidates': [
                { 'name': 'Johan', 'party': 'democrats' }
            ],
            'parties': [
                { 'name': 'democrats' }
            ]
        };
        await request(server).post(baseRoute + '/start').send(body);
        await request(server).post(baseRoute + '/advance-phase');
        await request(server).post(baseRoute + '/advance-phase');
        const response = await request(server).post(baseRoute + '/advance-phase');
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has already ended' });
    });
}
);