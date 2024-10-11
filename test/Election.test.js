import { expect } from 'chai';
import pkg from 'hardhat';
const { ethers } = pkg;

describe('Election Contract', function () {
    let ElectionContract;
    let election;
    let owner, addr1;

    beforeEach(async function () {
        // Get the contract and deploy it
        ElectionContract = await ethers.getContractFactory('Election');
         
        [owner, addr1] = await ethers.getSigners();
        election = await ElectionContract.deploy();
    });

    it('Should set the right owner', async function () {
        expect(await election.electionOwner()).to.equal(owner.address);
    });

    it('Should start in the registration phase', async function () {
        expect(await election.phase()).to.equal(0); // Registration phase
    });

    it('Should add a candidate', async function () {
        await election.addCandidate('Alice', 'PartyA');
        const candidate = await election.getCandidate(0);
        expect(candidate[0]).to.equal('Alice');
        expect(candidate[1]).to.equal('PartyA');
    });

    it('Should add a party', async function () {
        await election.addParty('PartyA');
        const party = await election.getParty(0);
        expect(party[0]).to.equal('PartyA');
    });

    it('Should generate voting keys', async function () {
        await election.generateVotingKeys(5);
        const totalKeys = await election.totalGeneratedKeys();
        expect(totalKeys).to.equal(5);
    });

    it('Should transition to voting phase', async function () {
        await election.startVotingPhase();
        expect(await election.phase()).to.equal(1); // Voting phase
    });

    it('Should transition to tallying phase', async function () {
        await election.startVotingPhase();
        await election.endVotingPhase();
        expect(await election.phase()).to.equal(2); // Tallying phase
    });
});
