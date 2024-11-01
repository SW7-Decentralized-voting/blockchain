import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import convertBigIntToString from '../utils/convertBigIntToString.js';

async function getParties(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    try {
        const parties = await election.getParties();
        const partiesWithStrings = convertBigIntToString(parties);
        res.json(partiesWithStrings);
    } catch (error) {
        next(error);
    }
}

async function publishParty(name) {
    const election = getElection();
    if (election === null) {
        throw new Error('Election has not started');
    }

    if (!name) {
        throw new Error('Party name is required');
    }

    try {
        const currentPhase = await election.phase();
        if (currentPhase !== ElectionPhase.Registration) {
            throw new Error('Parties can only be added during the registration phase');
        }

        const tx = await election.addParty(name);
        await tx.wait();

        return tx.hash;
    } catch (error) {
        console.error(error);
    }
}



export { getParties, publishParty };