import { ABI, ABIBytecode, accounts, ElectionPhase } from '../utils/constants.js';
import { getElection } from '../utils/electionManager.js';
import { publishParty } from '../controllers/party.js';
import { publishCandidate } from '../controllers/candidate.js';
//import { generateKeyPair } from '../utils/encryption.js';
import startContract from '../utils/startContract.js';

async function startElection(req, res, next) {
    if (getElection() !== null) {
        return res.status(400).json({ error: 'Election has already started' });
    }

    // Parse req to a list of candidates and parties
    const { candidates, parties } = req.body;
    if (!candidates || !parties) {
        return res.status(400).json({ error: 'Candidates and parties are required' });
    }

    try {
        // Generate a key pair for homomorphic encryption
        //const { publicKey, privateKey } = await generateKeyPair();

        // Start the contract and set the election instance
        await startContract(ABI, ABIBytecode, accounts.citizen1);

        for (const party of parties) {
            await publishParty(party.name);
        }

        for (const candidate of candidates) {
            await publishCandidate(candidate.name, candidate.party);
        }

        //await election.uploadEncryptionKey(publicKeyString);

        // Upload the serialized private key to the smart contract
        //await election.uploadDecryptionKey(privateKeyString);

        // Respond with a success message and the public key
        //res.status(200).json({ message: 'Election started successfully', publicKeyString });
        res.status(200).json({ message: 'Election started successfully' });
    } catch (error) {
        next(error);
    }
}

async function advanceElectionPhase(req, res, next) {
    const election = getElection();
    if (election === null) {
        return res.status(400).json({ error: 'Election has not started' });
    }

    const currentPhase = await election.phase();

    try {
        if (currentPhase === ElectionPhase.Registration) {
            const tx = await election.startVotingPhase();
            await tx.wait();
            res.json({ message: 'Election phase advanced to voting phase', transactionHash: tx.hash });
        }
        if (currentPhase === ElectionPhase.Voting) {
            const tx = await election.startTallyingPhase();
            await tx.wait();
            res.json({ message: 'Election phase advanced to tallying phase', transactionHash: tx.hash });
        }
        if (currentPhase === ElectionPhase.Tallying) {
            // Cannot advance past tallying phase
            res.status(400).json({ error: 'Election has already ended' });
        }
    } catch (error) {
        next(error);
    }
}

export { startElection, advanceElectionPhase };