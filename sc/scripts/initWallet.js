// scripts/initWallet.js
const { ethers } = require("hardhat");

async function main() {
  const deployedAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace witth FFP Address

  const [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();

  const ffpContract = await ethers.getContractAt("FFP", deployedAddress);
  
  const tx = await ffpContract.connect(owner).registerClubWallet(club.address, "Stay Humble FC", ethers.parseEther("10000"));
  await tx.wait();
  console.log("Registered club as the owner.");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
