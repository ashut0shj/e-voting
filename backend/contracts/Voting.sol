// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Voting {
    uint nextVoteId;

    struct Vote {
        string uri;
        address owner;
        uint endTime;
        uint[] votes;
        mapping(address => bool) voted;
        uint options;
    }

    mapping(uint => Vote) votes;
    mapping(address => bool) public members;

    event MemberJoined(
        address indexed member, 
        uint joinedAt
    );

    event VoteCreated(
        address indexed owner, 
        uint indexed voteId, 
        uint createdAt, 
        uint endTime
    );

    event Voted(
        address indexed voter, 
        uint indexed voteId, 
        uint indexed option, 
        uint createdAt
    );

    modifier isMember() {
        require(members[msg.sender], "You are not a member");
        _;
    }

    modifier canVote(uint voteId, uint option) {
        require(voteId < nextVoteId, "Vote does not exist");
        require(option < votes[voteId].options, "Option does not exist");
        require(!votes[voteId].voted[msg.sender], "You have already voted");
        require(
            block.timestamp < votes[voteId].endTime, 
            "Voting has ended  :("
        );
        _;
    }

    function join() external {
        require(!members[msg.sender], "You are already a member");
        
        members[msg.sender] = true;
        
        emit MemberJoined(
            msg.sender, 
            block.timestamp
        );
    }

    function createVote(
        string memory uri, 
        uint endTime, 
        uint options
    ) external isMember {
        require(options > 1, "There must be atleast 2 options");
        require(endTime > block.timestamp, "End time must be in the future");

        uint voteId = nextVoteId;

        votes[voteId].uri = uri;
        votes[voteId].owner = msg.sender;
        votes[voteId].endTime = endTime;
        votes[voteId].options = options;
        votes[voteId].votes = new uint256[](options);

        emit VoteCreated(
            msg.sender, 
            voteId, 
            block.timestamp, 
            endTime
        );

        nextVoteId++;
    }

    function vote(
        uint voteId, 
        uint option
    ) external isMember canVote(voteId, option) {
        votes[voteId].votes[option]++;
        votes[voteId].voted[msg.sender] = true;
        
        emit Voted(
            msg.sender, 
            voteId, 
            option, 
            block.timestamp
        );
    }

    function getVote(
        uint256 voteId
    ) public view returns (
        string memory, 
        address, 
        uint256[] memory, 
        uint256
    ) {
        return (
            votes[voteId].uri, 
            votes[voteId].owner, 
            votes[voteId].votes, 
            votes[voteId].endTime
        );
    }

    function didVote(
        address member, 
        uint256 voteId
    ) public view returns (bool) {
        return votes[voteId].voted[member];
    }
}
