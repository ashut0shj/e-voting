// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Create{
    using Counters for Counters.Counter;

    Counters.counter public _voterId;
    Counters.counter public _candidateId;

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

}
