const { expect } = require("chai");
// const { ethers } = require("hardhat");

describe("FFP", function () {
  let ffpContract, owner, club, clubOther, player, sponsor, nonRegistered;

  beforeEach(async function () {
    // Deploy the contract
    const FFP = await ethers.getContractFactory("FFP");
    [owner, club, clubOther, player, sponsor, nonRegistered] = await ethers.getSigners();
    ffpContract = await FFP.deploy("0x5E00a519A0301486d57AbBd153Bd2F2C2293EBbd");
    // await ffpContract.deployed();

    // Register wallets
    await ffpContract.connect(owner).registerClubWallet(club.address, 100);
    await ffpContract.connect(owner).registerClubWallet(clubOther.address, 50);
    await ffpContract.connect(owner).registerPlayerWallet(player.address);
    await ffpContract.connect(owner).registerSponsorWallet(sponsor.address);
  });

  it("Should register wallets correctly", async function () {
    const clubWallet = await ffpContract.wallets(club.address);
    expect(clubWallet.walletType).to.equal("club");
    expect(clubWallet.balance).to.equal(0);

    const playerWallet = await ffpContract.wallets(player.address);
    expect(playerWallet.walletType).to.equal("player");
    expect(playerWallet.balance).to.equal(0);
  });

  it("Should allow deposits to registered wallets", async function () {
    const depositAmount = ethers.parseEther("1");

    await ffpContract.connect(club).deposit({ value: depositAmount });

    const clubWallet = await ffpContract.wallets(club.address);
    expect(clubWallet.balance).to.equal(depositAmount);
  });

  it("Should not allow deposits to non-registered wallets", async function () {
    const depositAmount = ethers.parseEther("1");

    await expect(
      ffpContract.connect(nonRegistered).deposit({ value: depositAmount })
    ).to.be.revertedWith("Wallet not registered");
  });

  it("Should allow withdrawals by wallet owners", async function () {
    const depositAmount = ethers.parseEther("1");
    const withdrawAmount = ethers.parseEther("0.5");

    // Deposit to the club wallet
    await ffpContract.connect(club).deposit({ value: depositAmount });

    // Withdraw funds
    await ffpContract.connect(club).withdraw(withdrawAmount);

    const clubWallet = await ffpContract.wallets(club.address);
    expect(clubWallet.balance).to.equal(depositAmount - withdrawAmount);
  });

  it("Should not allow withdrawals exceeding wallet balance", async function () {
    const depositAmount = ethers.parseEther("1");
    const withdrawAmount = ethers.parseEther("2");

    // Deposit to the club wallet
    await ffpContract.connect(club).deposit({ value: depositAmount });

    // Attempt to withdraw more than the balance
    await expect(
      ffpContract.connect(club).withdraw(withdrawAmount)
    ).to.be.revertedWith("Insufficient balance");
  });

  it("Should allow transfers between registered wallets", async function () {
    const depositAmount = ethers.parseEther("2");
    const transferAmount = ethers.parseEther("1");

    // Deposit to the club wallet
    await ffpContract.connect(club).deposit({ value: depositAmount });

    // Transfer from club to player
    await ffpContract.connect(club).transfer(player.address, transferAmount, "playerSalary");

    const clubWallet = await ffpContract.wallets(club.address);
    const playerWallet = await ffpContract.wallets(player.address);

    expect(clubWallet.balance).to.equal(depositAmount - transferAmount);
    expect(playerWallet.balance).to.equal(transferAmount);
  });

  it("Should enforce revenue constraints for player purchases", async function () {
    const depositAmount = ethers.parseEther("5");
    // const transferAmount = ethers.parseEther("2");

    // Simulate club revenue
    // await ffpContract.connect(owner).registerWallet(club.address, "club");
    // await ffpContract.connect(owner).registerWallet(clubOther.address, "club");

    // Deposit to the club wallet
    await ffpContract.connect(club).deposit({ value: depositAmount });
    await ffpContract.connect(club).transfer(clubOther.address, ethers.parseEther("2"), "playerPurchase");

    // await ffpContract.connect(owner).registerWallet(sponsor.address, "sponsor");
    // const availableRevenue = await ffpContract.spentClubRevenue(sponsor.address);
    // console.log(availableRevenue);
  });
});
