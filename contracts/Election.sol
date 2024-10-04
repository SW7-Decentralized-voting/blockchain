// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "hardhat/console.sol";

contract Election {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    address public owner;
    uint public candidateCount;

    event ElectionResult(uint candidateId, string name, uint voteCount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You aren't the owner");
        _;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender], "You can't vote twice");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }

    function getCandidate(uint _candidateId) public view returns (uint, string memory, uint) {
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

    function endElection() public onlyOwner {
        for (uint i = 1; i <= candidateCount; i++) {
            emit ElectionResult(candidates[i].id, candidates[i].name, candidates[i].voteCount);
        }
    }

}