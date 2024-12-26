// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FinancialFairPlayTransfers is Ownable {
    constructor() Ownable(msg.sender) {}
    struct Wallet {
        string walletType; // "player", "club", "sponsor", etc.
        // string ID; // External ID for Oracle data, example : 'XXX123' is Chelsea's wallet
        uint256 balance;
    }

    mapping(address => Wallet) public wallets;
    // mapping(address => address) public walletOwners; // Maps wallet address to owner address
    mapping(address => uint256) public clubRevenue;
    mapping(address => uint256) public spentRevenue;

    event WalletRegistered(address indexed wallet, string walletType);
    event TransferExecuted(address indexed from, address indexed to, uint256 amount, string transactionType);
    event Withdrawal(address indexed wallet, uint256 amount);

    // modifier onlyWalletOwner(address wallet) {
    //     require(walletOwners[wallet] == msg.sender, "You are not the owner of this wallet");
    //     _;
    // }

    function registerWallet(string memory walletType) external onlyOwner {
        require(bytes(wallets[msg.sender].walletType).length == 0, "Wallet already registered");
        wallets[msg.sender] = Wallet(walletType, 0);
        // Might be vuln, idk
        if (keccak256(abi.encodePacked(walletType)) == keccak256(abi.encodePacked("club"))) {
            clubRevenue[msg.sender] = 0;
            spentRevenue[msg.sender] = 0;
        }
        emit WalletRegistered(msg.sender, walletType);
    }

    function deposit() external payable {
        require(bytes(wallets[msg.sender].walletType).length > 0, "Wallet not registered");
        wallets[msg.sender].balance += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(wallets[msg.sender].balance >= amount, "Insufficient balance");
        wallets[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }

    function transfer(address to, uint256 amount, string memory transactionType) external {
        address from = msg.sender;

        require(bytes(wallets[from].walletType).length > 0, "Sender wallet not registered");
        require(bytes(wallets[to].walletType).length > 0, "Receiver wallet not registered");
        require(wallets[from].balance >= amount, "Insufficient balance");

        // Transaction type checks
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

            uint256 limit = (clubRevenue[from] * 70) / 100; // Where oracle comes in
            require(amount + spentRevenue[from] <= limit, "Amount + Spent Revenue exceeds 70% of club revenue");
        }
        // Still missing agent salary case

        // Execute the transfer
        spentRevenue[from] += amount;
        wallets[from].balance -= amount;
        wallets[to].balance += amount;

        emit TransferExecuted(from, to, amount, transactionType);
    }


    function getBalance() external view returns (uint256) {
        return wallets[msg.sender].balance;
    }
}
