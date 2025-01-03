const { ethers } = require("hardhat");

async function main() {
  const deployedAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replace with FFP Address

  const [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();

  const ffpContract = await ethers.getContractAt("FFP", deployedAddress);
  
  const tx = await ffpContract.connect(clubOther).deposit({value: ethers.parseEther("1000")});
  await tx.wait();
  console.log("Deposited as the owner.");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
