// scripts/initWallet.js
const { ethers } = require("hardhat");

async function main() {
  const deployedAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // <-- replace with your actual contract address

  const [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();

  const ffpContract = await ethers.getContractAt("FFP", deployedAddress);
  
  const tx = await ffpContract.connect(club).deposit({value: ethers.parseEther("100")});
  await tx.wait();
  console.log("Deposited as the owner.");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
