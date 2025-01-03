const hre = require("hardhat");

async function main() {
    [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("Oracle");
    const oracleContract = await Oracle.connect(owner).deploy();
    const oracleAddress = await oracleContract.getAddress();


    const FFP = await ethers.getContractFactory("FFP");
    const ffpContract = await FFP.connect(owner).deploy(oracleAddress);
    const ffpAddress = await ffpContract.getAddress();


    console.log("Oracle deployed to:", oracleAddress);
    console.log("FFP deployed to:", ffpAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
