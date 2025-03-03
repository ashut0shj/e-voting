const { ethers } = require("hardhat");

async function main() {
    const Create = await ethers.getContractFactory("Create"); 
    const create = await Create.deploy(); 

    await create.waitForDeployment(); 

    console.log("Contract deployed at:", await create.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
