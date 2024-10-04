const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election Contract", function () {
    let Election;
    let election;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Election = await ethers.getContractFactory("Election");
        election = await Election.deploy();
    });

    it("Should set the correct owner", async function () {
        expect(await election.owner()).to.equal(owner.address);
    });

    it("Should allow the owner to add candidates", async function () {
        await election.addCandidate("Alice");
        await election.addCandidate("Bob");

        // Destructure the tuple returned by getCandidate
        const [id1, name1, voteCount1] = await election.getCandidate(1);
        const [id2, name2, voteCount2] = await election.getCandidate(2);

        expect(name1).to.equal("Alice");
        expect(name2).to.equal("Bob");
        expect(voteCount1).to.equal(0);
        expect(voteCount2).to.equal(0);
    });

    it("Should prevent non-owners from adding candidates", async function () {
        await expect(election.connect(addr1).addCandidate("Charlie"))
            .to.be.revertedWith("You aren't the owner");
    });

    it("Should allow users to vote for candidates", async function () {
        await election.addCandidate("Alice");
        await election.addCandidate("Bob");

        await election.connect(addr1).vote(1);

        // Destructure the tuple to access voteCount
        const [id1, name1, voteCount1] = await election.getCandidate(1);
        expect(voteCount1).to.equal(1);
    });

    it("Should prevent users from voting twice", async function () {
        await election.addCandidate("Alice");

        await election.connect(addr1).vote(1);
        await expect(election.connect(addr1).vote(1))
            .to.be.revertedWith("You can't vote twice");
    });

    it("Should prevent voting for invalid candidates", async function () {
        await expect(election.connect(addr1).vote(1))
            .to.be.revertedWith("Invalid candidate");
    });

    it("Should emit election results at the end", async function () {
        await election.addCandidate("Alice");
        await election.addCandidate("Bob");

        await election.connect(addr1).vote(1);
        await election.connect(addr2).vote(2);

        await expect(election.endElection())
            .to.emit(election, "ElectionResult")
            .withArgs(1, "Alice", 1)
            .and.to.emit(election, "ElectionResult")
            .withArgs(2, "Bob", 1);
    });

    it("Should prevent non-owners from ending the election", async function () {
        await election.addCandidate("Alice");
        await expect(election.connect(addr1).endElection())
            .to.be.revertedWith("You aren't the owner");
    });
});