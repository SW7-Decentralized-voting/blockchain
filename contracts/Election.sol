// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Election {
    enum ElectionPhase { Registration, Voting, Tallying }
    ElectionPhase public phase;

    struct Candidate {
        uint id;
        string name;
        string party;
    }

    struct Party {
        uint id;
        string name;
    }

    mapping(uint => Candidate) public candidates;    // To store candidates
    mapping(uint => Party) public parties;           // To store parties
    
    uint public totalCandidates;
    uint public totalParties;
    uint private uniqueIdCounter;
    
    address public electionOwner;
    string public encryptionKey;
    string public decryptionKey;

    event VoteCast(string[] _encryptedVoteVector);
    event PhaseChanged(ElectionPhase newPhase);

    string[][] public encryptedVoteVectors;

    constructor() {
        electionOwner = msg.sender;
        phase = ElectionPhase.Registration; // Start in the registration phase
    }

    modifier onlyOwner() {
        require(msg.sender == electionOwner, "Only the election owner can perform this action.");
        _;
    }

    modifier inPhase(ElectionPhase requiredPhase) {
        require(phase == requiredPhase, "Invalid phase for this action.");
        _;
    }

    function addCandidate(string memory _name, string memory _party) public onlyOwner inPhase(ElectionPhase.Registration) {
        candidates[totalCandidates] = Candidate(uniqueIdCounter, _name, _party);
        totalCandidates++;
        uniqueIdCounter++;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](totalCandidates);
        for (uint i = 0; i < totalCandidates; i++) {
            candidateList[i] = candidates[i];
        }
        return candidateList;
    }

    function addParty(string memory _name) public onlyOwner inPhase(ElectionPhase.Registration) {
        parties[totalParties] = Party(uniqueIdCounter, _name);
        totalParties++;
        uniqueIdCounter++;
    }

    function startVotingPhase() public onlyOwner inPhase(ElectionPhase.Registration) {
        phase = ElectionPhase.Voting;
        emit PhaseChanged(ElectionPhase.Voting);
    }

    function castVote(string[] memory _encryptedVoteVector) public onlyOwner inPhase(ElectionPhase.Voting) {
    // Check that the vote vector is the correct length
    require(_encryptedVoteVector.length == uniqueIdCounter-1, "Invalid vote vector length.");
    encryptedVoteVectors.push(_encryptedVoteVector);
    emit VoteCast(_encryptedVoteVector);
    }

    function startTallyingPhase() public onlyOwner inPhase(ElectionPhase.Voting) {
        phase = ElectionPhase.Tallying;
        emit PhaseChanged(ElectionPhase.Tallying);
    }

    function uploadEncryptionKey(string memory key) public onlyOwner inPhase(ElectionPhase.Registration) {
        encryptionKey = key;
    }

    function uploadDecryptionKey(string memory key) public onlyOwner inPhase(ElectionPhase.Tallying) {
        decryptionKey = key;
    }

    function getCandidate(uint candidateId) public view returns (string memory, string memory) {
        return (candidates[candidateId].name, candidates[candidateId].party);
    }

    function getParty(uint partyId) public view returns (string memory) {
        return (parties[partyId].name);
    }

    function getParties() public view returns (Party[] memory) {
        Party[] memory partyList = new Party[](totalParties);
        for (uint i = 0; i < totalParties; i++) {
            partyList[i] = parties[i];
        }
        return partyList;
    }

    function getEncryptedVoteVectors() public view returns (string[][] memory) {
        return encryptedVoteVectors;
    }
}