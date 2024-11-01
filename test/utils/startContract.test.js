import startContract from '../../utils/startContract.js';
import stopContract from '../../utils/stopContract.js';
import { getElection } from '../../utils/electionManager.js';

beforeEach(async () => {
    await stopContract();
}
);

describe('startContract with no contract deployed', () => {
    test('It should set the election instance', async () => {
        await startContract();
        const election = getElection();
        expect(election).toBeDefined();
    });
});

describe('startContract with a contract already deployed', () => {
    test('It should throw an error', async () => {
        await startContract();
        await expect(startContract()).rejects.toThrow('Election has already started');
    });
});