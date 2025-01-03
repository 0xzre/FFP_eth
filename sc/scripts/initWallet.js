// scripts/initWallet.js
const { ethers } = require("hardhat");

async function main() {
  const deployedAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // <-- replace with your actual contract address

  const [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();

  const ffpContract = await ethers.getContractAt("FFP", deployedAddress);
  
  const tx = await ffpContract.connect(owner).registerClubWallet(clubOther.address, 10000);
  await tx.wait();
  console.log("Registered club as the owner.");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
