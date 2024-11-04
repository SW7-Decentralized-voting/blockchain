import startContract from '../../utils/startContract';
import stopContract from '../../utils/stopContract';
import { getElection } from '../../utils/electionManager';

beforeEach(async () => {
    await startContract();
}
);

describe('stopContract', () => {
    test('It should set the election instance to null', async () => {
        expect(getElection()).toBeDefined();
        await stopContract();
        const election = getElection();
        expect(election).toBeNull();
    });

    test('It should do nothing when no contract is deployed', async () => {
        await stopContract();
        const election = getElection();
        expect(election).toBeNull();
    });
});