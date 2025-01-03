const hre = require("hardhat");

async function main() {
    const FFP = await ethers.getContractFactory("FFP");
    [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();
    ffpContract = await FFP.connect(owner).deploy("0x5E00a519A0301486d57AbBd153Bd2F2C2293EBbd");


    console.log("MyContract deployed to:", ffpContract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
