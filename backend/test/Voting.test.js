const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
    let Voting, voting, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy();
    });

    it("Should allow a user to join", async function () {
        await voting.connect(addr1).join();
        expect(await voting.members(addr1.address)).to.be.true;
    });

    it("Should not allow the same user to join twice", async function () {
        await voting.connect(addr1).join();
        await expect(voting.connect(addr1).join()).to.be.revertedWith("You are already a member");
    });

    it("Should create a vote successfully", async function () {
        await voting.connect(addr1).join();
        await expect(voting.connect(addr1).createVote("Vote 1", Math.floor(Date.now() / 1000) + 1000, 3))
            .to.emit(voting, "VoteCreated");
    });

    it("Should not allow non-members to create a vote", async function () {
        await expect(voting.connect(addr1).createVote("Vote 1", Math.floor(Date.now() / 1000) + 1000, 3))
            .to.be.revertedWith("You are not a member, fuckoff");
    });

    it("Should allow a user to vote", async function () {
        await voting.connect(addr1).join();
        await voting.connect(addr1).createVote("Vote 1", Math.floor(Date.now() / 1000) + 1000, 3);

        await voting.connect(addr2).join();
        await expect(voting.connect(addr2).vote(0, 1)).to.emit(voting, "Voted");
    });

    it("Should not allow a user to vote twice", async function () {
        await voting.connect(addr1).join();
        await voting.connect(addr1).createVote("Vote 1", Math.floor(Date.now() / 1000) + 1000, 3);

        await voting.connect(addr2).join();
        await voting.connect(addr2).vote(0, 1);
        await expect(voting.connect(addr2).vote(0, 2)).to.be.revertedWith("You have already voted");
    });

    it("Should return correct vote details", async function () {
        await voting.connect(addr1).join();
        await voting.connect(addr1).createVote("Vote 1", Math.floor(Date.now() / 1000) + 1000, 3);

        const vote = await voting.getVote(0);
        expect(vote[0]).to.equal("Vote 1");
        expect(vote[1]).to.equal(addr1.address);
    });

});
