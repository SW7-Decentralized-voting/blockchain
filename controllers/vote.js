import { getElection } from '../utils/electionManager.js';
import { ElectionPhase } from '../utils/constants.js';
import { Buffer } from 'buffer';
import { publicEncrypt } from 'crypto';

async function vote(req, res, next) {
    const election = getElection();

    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const currentPhase = await election.phase();
    if (currentPhase !== ElectionPhase.Voting) {
        return res.status(400).json({ error: 'Election is not in the voting phase' });
    }

    const id  = req.body.id;

    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }

    const encryptionKey = await election.encryptionKey();

    if (!encryptionKey) {
        return res.status(400).json({ error: 'Encryption key is not set' });
    }

    const encryptedVote = publicEncrypt(encryptionKey, Buffer.from(id));

    try {
        const tx = await election.castVote(encryptedVote);
        await tx.wait();

        res.json({
            message: 'Vote cast successfully',
            transactionHash: tx.hash
        });
    } catch (error) {
        next(error);
    }
}

export { vote };