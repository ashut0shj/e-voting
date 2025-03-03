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

    function getCandidateLength() public view returns (uint256) {
        return candidateAddress.length;
    }   

    function getCandidateData(address _address) public view returns (uint256, uint, string memory, string memory, uint256, address, string memory) {
        return (
            candidates[_address].candidateId,
            candidates[_address].age,
            candidates[_address].name,
            candidates[_address].image,
            candidates[_address].voteCount,
            candidates[_address]._address,
            candidates[_address].ifps
        );
    }
    function voterRight(address _address, string memory _name, string memory _image, string memory _ifps) public {
        require(msg.sender == votingOrganiser, "Only the voting organiser can add voters");
        
        _voterId.increment();

        uint256 IdNumber = _voterId.current();

        Voter storage voter = voters[_address];

        require(voter.voter_allowed == 0, "Voter already exists");
        
        voter.voter_allowed = 1;
        voter.voter_voterId = IdNumber;
        voter.voter_name = _name;
        voter.voter_image = _image;
        voter.voter_address = _address;
        voter.voter_voted = false;
        voter.voter_vote = 1000;
        voter.voter_ifps = _ifps;

        votersAddress.push(_address);

        emit VoterCreate(
            IdNumber, 
            _name, 
            _image, 
            _address, 
            voter.voter_allowed, 
            voter.voter_voted, 
            voter.voter_vote, 
            _ifps
        );

    }


    function vote(address _candidateAddress, uint256 _candidateVoteId) external{
        Voter storage voter = voters[msg.sender];
        
        require(voter.voter_allowed != 0, "You are not allowed to vote");
        require(voter.voter_voted == false, "You have already voted");

        voter.voter_voted = true;
        voter.voter_vote = _candidateVoteId;

        votedVoters.push(msg.sender);

        candidates[_candidateAddress].voteCount += voter.voter_allowed;
    }

    function getVoterLength() public view returns (uint256){
        return votersAddress.length;

    }


    function getVoterData (address _address) public view returns (uint256, string memory, string memory, address, string memory, uint256, bool )
    {
        return(
            voters[_address].voter_voterId,
            voters[_address].voter_name,
            voters[_address].voter_image,
            voters[_address].voter_address,
            voters[_address].voter_ifps,
            voters[_address].voter_allowed,
            voters[_address].voter_voted
        );
    }



    function getVotedVoterList() public view returns (address[] memory){
        return votedVoters;
    }


    function getVoterList() public view returns (address[] memory){
        return votersAddress;
    }

    // winner function remaining 

}
