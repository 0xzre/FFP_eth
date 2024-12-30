// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for the Oracle contract
interface IOracle {
    function createRequest(string memory _urlToQuery, string memory _attributeToFetch) external;
    function updateRequest(uint _id, string memory _valueRetrieved) external;
    event UpdatedRequest(uint id, string urlToQuery, string attributeToFetch, string agreedValue);
}

contract FinancialFairPlayTransfers is Ownable {
    IOracle public oracle;
    uint256 public minPercentage;  // Dynamic min percentage fetched from the Oracle

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
    event OracleDataUpdated(uint256 requestId, string valueRetrieved);

    constructor(address oracleAddress) Ownable(msg.sender) {
        oracle = IOracle(oracleAddress);
    }

    function registerWallet(address wallet, string memory walletType) external onlyOwner {
        require(bytes(wallets[wallet].walletType).length == 0, "Wallet already registered");
        wallets[wallet] = Wallet(walletType, 0);
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
        currentclubRevenue[msg.sender] -= amount;
        emit Withdrawal(msg.sender, amount);
    }

    function transfer(address to, uint256 amount, string memory transactionType) external {
        address from = msg.sender;
        require(bytes(wallets[from].walletType).length > 0, "Sender wallet not registered");
        require(bytes(wallets[to].walletType).length > 0, "Receiver wallet not registered");
        require(wallets[from].balance >= amount, "Insufficient balance");

        if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("playerSalary"))) {
            require(keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("club")), "Only clubs can pay salaries");
        } else if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("playerPurchase"))) {
            require(keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("club")), "Only clubs can purchase players");
            require(keccak256(abi.encodePacked(wallets[to].walletType)) == keccak256(abi.encodePacked("club")), "Receiver must be a club");

            // Use dynamic minPercentage fetched from the Oracle
            uint256 availableRevenue = currentclubRevenue[from] - spentClubRevenue[from];
            require((availableRevenue * minPercentage) / 100 >= amount, "Club's revenue must be at least minPercentage of Amount sent");

            spentClubRevenue[from] += amount;
            currentclubRevenue[to] += amount;
        }

        wallets[from].balance -= amount;
        wallets[to].balance += amount;
        emit TransferExecuted(from, to, amount, transactionType);
    }

    // Function to trigger an API request via the Oracle contract to fetch the minPercentage
    function triggerAPIRequest(string memory url, string memory attribute) external onlyOwner {
        require(address(oracle) != address(0), "Oracle not set");
        oracle.createRequest(url, attribute);
    }

    // Function to receive Oracle callback and update the minPercentage from the Oracle response
    function fulfillOracleRequest(uint256 requestId, string memory valueRetrieved) external {
        require(msg.sender == address(oracle), "Only the Oracle can fulfill requests");

        // Update minPercentage dynamically based on the Oracle's response (assuming it returns a valid number as string)
        minPercentage = stringToUint(valueRetrieved);

        emit OracleDataUpdated(requestId, valueRetrieved);
    }

    // Convert string to uint256 (to store the percentage value)
    function stringToUint(string memory str) public pure returns (uint256) {
        bytes memory b = bytes(str);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            result = result * 10 + (uint256(uint8(b[i])) - 48);  // Subtract ASCII value of '0' to get the number
        }
        return result;
    }

    function getBalance() external view returns (uint256) {
        return wallets[msg.sender].balance;
    }

    // Owner-only function to set Oracle contract address if needed
    function setOracle(address oracleAddress) external onlyOwner {
        oracle = IOracle(oracleAddress);
    }
}
