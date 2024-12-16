import request from 'supertest';
import express from 'express';
import stopContract from '../../utils/stopContract.js';
import { getElection } from '../../utils/electionManager.js';
import electionRouter from '../../routes/electionRoutes.js';
import * as paillierBigint from 'paillier-bigint';
import { expect, jest } from '@jest/globals';

let router, voteRouter;
const baseRoute = '/tally';

const app = express();
app.use(express.json());
app.use(baseRoute, async (req, res, next) => (await router)(req, res, next));
app.use('/election', electionRouter);
app.use('/vote', async (req, res, next) => (await voteRouter)(req, res, next));

const server = app.listen(0);

jest.unstable_mockModule('../../middleware/auth.js', () => {
    return {
        default: jest.fn((req, res, next) => next()),
    };
});

beforeAll(async () => {
    router = (await import('../../routes/tallyRoutes.js')).default;
    voteRouter = (await import('../../routes/voteRoutes.js')).default;
});

beforeEach(async () => {
    await stopContract();
});

afterAll(() => {
    server.close();
});


describe('POST /tally', () => {
    jest.setTimeout(5000000);
    it('Should return the tally', async () => {
        const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(3072);

        const privateKeyObject = {
            lambda: privateKey.lambda.toString(),
            mu: privateKey.mu.toString(),
            publicKey: {
                n: privateKey.publicKey.n.toString(),
                g: privateKey.publicKey.g.toString()
            }
        };

        const publicKeyString = JSON.stringify({
            n: publicKey.n.toString(),
            g: publicKey.g.toString()
        });

        const body = {
            'candidates': [
                {'voteId': '0', 'name': 'Dwayne "The Rock" Johnson', 'party': 'democrats' },
                {'voteId': '1', 'name': 'Arnold Schwarzenegger', 'party': 'republicans' },
                {'voteId': '2', 'name': 'Tom Hanks', 'party': 'democrats' }
            ],
            'parties': [
                {'voteId': '3', 'name': 'democrats' }
            ],
            'publicKey': publicKeyString
        };
        
        await request(app).post('/election/start').send(body);
        await getElection().startVotingPhase();

        let totalVoteTime = 0;
        const voteCount = 900;
        for (let i = 0; i < voteCount; i++) {
            const startVoteTime = process.hrtime();
            await request(app).post('/vote').send({ voteId: 0 });
            const endVoteTime = process.hrtime(startVoteTime);
            totalVoteTime += endVoteTime[0] * 1000 + endVoteTime[1] / 1000000; // convert to milliseconds
        }

        const averageVoteTime = totalVoteTime / voteCount;
        // eslint-disable-next-line no-console
        console.log(`Average vote time: ${averageVoteTime} ms`);

        // eslint-disable-next-line no-console
        console.time('Tallying time');
        await getElection().startTallyingPhase();
        const response = await request(app)
            .post(`${baseRoute}/`)
            .send({ privateKey: privateKeyObject });
            // eslint-disable-next-line no-console
        console.timeEnd('Tallying time');

        expect(response.statusCode).toBe(200);
    });
});