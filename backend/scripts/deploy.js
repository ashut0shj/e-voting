const { ethers } = require("hardhat");
const fs = require("fs/promises");

async function main() {
    const Voting = await ethers.getContractFactory("Voting");  // ✅ Correct ethers usage
    const voting = await Voting.deploy();  // ✅ Deploy contract
    await voting.waitForDeployment();      // ✅ Ensures deployment completion

    await writeDeploymentInfo(voting, "Voting.json");
    console.log(`Voting contract deployed to: ${await voting.getAddress()}`);
}

async function writeDeploymentInfo(contract, fileName = '') {
    const contractInfo = {
        Contract: {
            address: await contract.getAddress(),  // ✅ Fix accessing contract address
            signerAddress: contract.runner.address, // ✅ Use runner instead of signer
            abi: contract.interface.format("json")
        }
    };
    const deploymentInfo = JSON.stringify(contractInfo, null, 2);
    await fs.writeFile(fileName, deploymentInfo, { encoding: "utf-8" });
    console.log(`Deployment details saved to ${fileName}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
