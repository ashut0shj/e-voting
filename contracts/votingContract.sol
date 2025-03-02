// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Create{
    using Counters for Counters.Counter;

    Counters.Counter public _voterId;
    Counters.Counter public _candidateId;

    address public votingOrganiser;

    struct Candidate{
        uint256 candidateId;
        uint age;
        string name;
        string image;
        uint256 voteCount;
        address _address;
        string ifps;
    }

    event CandidateCreate (
        uint256 indexed candidateId,
        uint age,
        string name,
        string image,
        uint256 voteCount,
        address _address,
        string ifps
    );

    address[] public candidateAddress;

    mapping(address => Candidate) public candidates;



    address[] public votedVoters;
    address[] public votersAddress;

    mapping(address => Voter) public voters;
    
    struct Voter {
        uint256 voter_voterId;
        string voter_name;
        string voter_image;
        address voter_address;
        uint256 voter_allowed;
        bool voter_voted;
        uint256 voter_vote;
        string voter_ifps;
    }

    event VoterCreate (
        uint256 indexed voter_voterId,
        string voter_name,
        string voter_image,
        address voter_address,
        uint256 voter_allowed,
        bool voter_voted,
        uint256 voter_vote,
        string voter_ifps
    );


    constructor() {
        votingOrganiser = msg.sender;
    }

    function setCandidate(address _address, uint _age, string memory _name, string memory _image, string memory _ifps) public {
        require(msg.sender == votingOrganiser, "Only the voting organiser can add candidates");
        
        _candidateId.increment();

        uint256 IdNumber = _candidateId.current();

        Candidate storage candidate = candidates[_address];
        candidate.candidateId = IdNumber;
        candidate.age = _age;
        candidate.name = _name;
        candidate.image = _image;
        candidate.voteCount = 0;
        candidate._address = _address;
        candidate.ifps = _ifps;

        candidateAddress.push(_address);

        emit CandidateCreate(
            IdNumber, 
            _age, 
            _name, 
            _image, 
            candidate.voteCount, 
            _address, 
            _ifps
        );



    }

    function getCandidate() public view returns (address[] memory) {
        return candidateAddress;
    }
    
}
