// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FinancialFairPlayTransfers is Ownable {
    constructor() Ownable(msg.sender) {}
    struct Wallet {
        string walletType; // "player", "club", "sponsor", etc.
        uint256 balance;
    }

    mapping(address => Wallet) public wallets;
    mapping(address => uint256) public currentclubRevenue;
    mapping(address => uint256) public spentClubRevenue;

    event WalletRegistered(address indexed wallet, string walletType);
    event TransferExecuted(address indexed from, address indexed to, uint256 amount, string transactionType);
    event Withdrawal(address indexed wallet, uint256 amount);

    // Only Admin will take care this one
    function registerWallet(address wallet, string memory walletType) external onlyOwner {
        require(bytes(wallets[wallet].walletType).length == 0, "Wallet already registered");
        wallets[wallet] = Wallet(walletType, 0);
        // Might be vuln, idk
        if (keccak256(abi.encodePacked(walletType)) == keccak256(abi.encodePacked("club"))) {
            currentclubRevenue[wallet] = 0;
            spentClubRevenue[wallet] = 0;
        }
        emit WalletRegistered(wallet, walletType);
    }

    function deposit() external payable {
        require(bytes(wallets[msg.sender].walletType).length > 0, "Wallet not registered");
        currentclubRevenue[msg.sender] += msg.value;
        wallets[msg.sender].balance += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(wallets[msg.sender].balance >= amount, "Insufficient balance");
        wallets[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);
        // TODO better logic
        currentclubRevenue[msg.sender] -= amount;

        emit Withdrawal(msg.sender, amount);
    }

    function transfer(address to, uint256 amount, string memory transactionType) external {
        address from = msg.sender;

        require(bytes(wallets[from].walletType).length > 0, "Sender wallet not registered");
        require(bytes(wallets[to].walletType).length > 0, "Receiver wallet not registered");
        require(wallets[from].balance >= amount, "Insufficient balance");

        if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("playerSalary"))) {
            require(
                keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("club")),
                "Only clubs can pay salaries"
            );
        } else if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("playerPurchase"))) {
            require(
                keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("club")),
                "Only clubs can purchase players"
            );
            require(
                keccak256(abi.encodePacked(wallets[to].walletType)) == keccak256(abi.encodePacked("club")),
                "Receiver must be a club"
            );

            // TODO Where oracle comes in
            uint256 minPercentage = 70;
            uint256 availableRevenue = currentclubRevenue[from] - spentClubRevenue[from];
            require((availableRevenue * minPercentage) / 100 >= amount, "Club's revenue must be at least 70% of Amount sent");
            // Update revenue tracking
            spentClubRevenue[from] += amount;
            currentclubRevenue[to] += amount;
        }
        // Still missing agent salary case

        wallets[from].balance -= amount;
        wallets[to].balance += amount;

        emit TransferExecuted(from, to, amount, transactionType);
    }


    function getBalance() external view returns (uint256) {
        return wallets[msg.sender].balance;
    }
}
