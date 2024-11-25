import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import startContract from '../../utils/startContract.js';
import { getElection } from '../../utils/electionManager.js';
import electionRouter from '../../routes/electionRoutes.js';
import * as paillierBigint from 'paillier-bigint';
import { jest } from '@jest/globals';

let router;
const baseRoute = '/vote';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));
app.use('/election', electionRouter);

const server = app.listen(0);

beforeAll(async () => {
    router = (await import('../../routes/voteRoutes.js')).default;
});

jest.unstable_mockModule('../../middleware/auth.js', () => {
	return {
		default: jest.fn((req, res, next) => next()),
	};
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});

describe('POST /vote', () => {
    test('It should respond with the error code 400 when no contract is deployed', async () => {
        const voteVector = [1];
        const response = await request(server)
            .post(baseRoute)
            .send({ voteVector });
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election has not started' });
    });

    test('It should respond with 400 when the election is not in the voting phase', async () => {
        await startContract();
        const voteVector = [1];
        const response = await request(server)
            .post(baseRoute)
            .send({ voteVector });
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ error: 'Election is not in the voting phase' });
    });

    test('It should respond with 400 when the election is in the voting phase but no encryption key has been set', async () => {
        await startContract();
        await getElection().startVotingPhase();
        const voteVector = [1];
        const response = await request(server)
            .post(baseRoute)
            .send({ voteVector });
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({error: 'Encryption key is not set'});
    });

    test('It should respond with 200 when the election is in the voting phase and an encryption key has been set', async () => {
        const { publicKey } = await paillierBigint.generateRandomKeys(3072);

          const publicKeyString = JSON.stringify({
            n: publicKey.n.toString(),
            g: publicKey.g.toString()
          });

        const body = {
            'candidates': [
                {'id': '0', 'name': 'Dwayne The Rock Johnson', 'party': 'democrats' },
                {'id': '1', 'name': 'Arnold Schwarzenegger', 'party': 'republicans' },
                {'id': '2', 'name': 'Tom Hanks', 'party': 'democrats' }
            ],
            'parties': [
                {'id': '3', 'name': 'democrats' }
            ],
            'publicKey': publicKeyString
        };

        await request(app).post('/election/start').send(body);
        await getElection().startVotingPhase();

        const voteVector = [1, 0, 0, 0];
        
        const response = await request(server)
            .post(baseRoute)
            .send({ voteVector });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Vote cast successfully', transactionHash: expect.any(String) });
    });
}
);