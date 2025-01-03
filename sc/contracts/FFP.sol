// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IOracle {
    function createRequest(string memory _urlToQuery, string memory _attributeToFetch) external;
    function updateRequest(uint _id, string memory _valueRetrieved) external;
    event UpdatedRequest(uint id, string urlToQuery, string attributeToFetch, string agreedValue);
}

contract FFP is Ownable {
    IOracle public oracle;
    uint256 public minPercentage = 70;  // Dynamic min percentage fetched from the Oracle

    struct Wallet {
        string name;
        string walletType; // "player", "club", "sponsor", etc.
        uint256 balance;
    }

    mapping(address => Wallet) public wallets;
    mapping(address => uint256) public clubRevenue;
    mapping(address => uint256) public spentClubMoney;

    event WalletRegistered(address indexed wallet, string name, string walletType);
    event TransferExecuted(address indexed from, address indexed to, uint256 amount, string transactionType);
    event Deposit(address indexed wallet, uint256 amount);
    event Withdrawal(address indexed wallet, uint256 amount);
    event OracleDataUpdated(uint256 requestId, string valueRetrieved);

    constructor(address oracleAddress) Ownable(msg.sender) {
        oracle = IOracle(oracleAddress);
    }

    function registerClubWallet(address wallet, string memory name, uint256 initialClubRevenue) external onlyOwner {
        require(bytes(wallets[wallet].walletType).length == 0, "Wallet already registered");
        wallets[wallet] = Wallet(name,"club", 0);
        clubRevenue[wallet] = initialClubRevenue;
        spentClubMoney[wallet] = 0;
        emit WalletRegistered(wallet, name, "club");
    }

    function registerPlayerWallet(address wallet, string memory name) external onlyOwner {
        require(bytes(wallets[wallet].walletType).length == 0, "Wallet already registered");
        wallets[wallet] = Wallet(name,"player", 0);
        emit WalletRegistered(wallet, name, "player");
    }

    function registerSponsorWallet(address wallet, string memory name) external onlyOwner {
        require(bytes(wallets[wallet].walletType).length == 0, "Wallet already registered");
        wallets[wallet] = Wallet(name, "sponsor", 0);
        emit WalletRegistered(wallet, name, "sponsor");
    }

    function deposit() external payable {
        require(bytes(wallets[msg.sender].walletType).length > 0, "Wallet not registered");
        require(msg.value > 0, "Deposit amount must be greater than 0");
        wallets[msg.sender].balance += msg.value;
        // clubRevenue[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(bytes(wallets[msg.sender].walletType).length > 0, "Wallet not registered");
        require(amount > 0, "Amount must be greater than 0");
        require(wallets[msg.sender].balance >= amount, "Insufficient balance");
        wallets[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);
        // clubRevenue[msg.sender] -= amount;
        emit Withdrawal(msg.sender, amount);
    }

    function transfer(address to, uint256 amount, string memory transactionType) external {
        address from = msg.sender;
        require(bytes(wallets[from].walletType).length > 0, "Sender wallet not registered");
        require(bytes(wallets[to].walletType).length > 0, "Receiver wallet not registered");
        require(amount > 0, "Amount must be greater than 0");
        require(wallets[from].balance >= amount, "Insufficient balance");

        if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("playerSalary"))) {
            require(keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("club")), "Only clubs can pay salaries");
            require(keccak256(abi.encodePacked(wallets[to].walletType)) == keccak256(abi.encodePacked("player")), "Receiver must be a player");

            // Enforce FFP Rule on Player Salary
            uint256 availableRevenue = clubRevenue[from] - spentClubMoney[from];
            require((availableRevenue * minPercentage) / 100 >= amount, "Club's revenue must be at least minPercentage of Amount sent");

            spentClubMoney[from] += amount;
            clubRevenue[to] += amount;

        } else if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("playerPurchase"))) {
            require(keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("club")), "Only clubs can purchase players");
            require(keccak256(abi.encodePacked(wallets[to].walletType)) == keccak256(abi.encodePacked("club")), "Receiver must be a club");

            // Enforce FFP Rule on Player Purchase
            uint256 availableRevenue = clubRevenue[from] - spentClubMoney[from];
            require((availableRevenue * minPercentage) / 100 >= amount, "Club's revenue must be at least minPercentage of Amount sent");

            spentClubMoney[from] += amount;
            clubRevenue[to] += amount;

        } else if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("sponsorship"))) {
            require(keccak256(abi.encodePacked(wallets[from].walletType)) == keccak256(abi.encodePacked("sponsor")), "Only sponsors can sponsor clubs");
            require(keccak256(abi.encodePacked(wallets[to].walletType)) == keccak256(abi.encodePacked("club")), "Receiver must be a club");

            clubRevenue[to] += amount;
        }
         else {
            revert("Invalid transaction type");
        }

        wallets[from].balance -= amount;
        wallets[to].balance += amount;
        emit TransferExecuted(from, to, amount, transactionType);
    }

    function getBalance() external view returns (uint256) {
        return wallets[msg.sender].balance;
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
}
