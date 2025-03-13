const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting Contract", function () {
    let Voting, voting, owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy(); // ✅ No `.deployed()`
    });

    it("Should allow users to join as members", async function () {
        await voting.connect(addr1).join();
        expect(await voting.didVote(addr1.address, 0)).to.equal(false);
    });

    it("Should allow members to create a vote", async function () {
        await voting.connect(addr1).join();
        await expect(voting.connect(addr1).createVote("testURI", Math.floor(Date.now() / 1000) + 600, 3))
            .to.emit(voting, "VoteCreated");

        const vote = await voting.getVote(0);
        expect(vote[0]).to.equal("testURI");
        expect(vote[1]).to.equal(addr1.address);
    });

    it("Should allow members to vote", async function () {
        await voting.connect(addr1).join();
        await voting.connect(addr2).join();

        const endTime = Math.floor(Date.now() / 1000) + 600;
        await voting.connect(addr1).createVote("testURI", endTime, 2);

        await expect(voting.connect(addr2).vote(0, 1))
            .to.emit(voting, "Voted");

        expect(await voting.didVote(addr2.address, 0)).to.equal(true);
    });

    it("Should not allow double voting", async function () {
        await voting.connect(addr1).join();
        await voting.connect(addr2).join();

        const endTime = Math.floor(Date.now() / 1000) + 600;
        await voting.connect(addr1).createVote("testURI", endTime, 2);

        await voting.connect(addr2).vote(0, 1);

        await expect(voting.connect(addr2).vote(0, 1))
            .to.be.revertedWith("You have already voted");
    });

    it("Should not allow voting after end time", async function () {
        await voting.connect(addr1).join();
        await voting.connect(addr2).join();
    
        // Get the current blockchain timestamp
        const latestBlock = await ethers.provider.getBlock("latest");
        const currentTimestamp = latestBlock.timestamp;
    
        // Set endTime to be in the future (3 seconds from now)
        const endTime = currentTimestamp + 3;
        await voting.connect(addr1).createVote("testURI", endTime, 2);
    
        // Wait for 5 seconds to ensure voting has ended
        await network.provider.send("evm_increaseTime", [5]); 
        await network.provider.send("evm_mine");
    
        // Now voting should fail because the end time has passed
        await expect(voting.connect(addr2).vote(0, 1))
            .to.be.revertedWith("Voting has ended  :(");
    });
    
    
    it("Should return correct vote details", async function () {
        await voting.connect(addr1).join();

        const endTime = Math.floor(Date.now() / 1000) + 600;
        await voting.connect(addr1).createVote("testURI", endTime, 2);

        const vote = await voting.getVote(0);
        expect(vote[0]).to.equal("testURI");
        expect(vote[1]).to.equal(addr1.address);
        expect(vote[3]).to.equal(endTime);
    });
});
