// import startOracle from "./oracle";
// import startConsumer from "./consumer";
// import startClient from "./client";

// startOracle();
// startConsumer();
// startClient();

// Import ethers.js
const { ethers } = require("ethers");
const dotenv = require('dotenv');
dotenv.config();

// Define the contract's ABI
const oracleABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "urlToQuery",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "attributeToFetch",
          "type": "string"
        }
      ],
      "name": "NewRequest",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "urlToQuery",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "attributeToFetch",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "agreedValue",
          "type": "string"
        }
      ],
      "name": "UpdatedRequest",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_urlToQuery",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_attributeToFetch",
          "type": "string"
        }
      ],
      "name": "createRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "currentId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minQuorum",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "requests",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "urlToQuery",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "attributeToFetch",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "agreedValue",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalOracleCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_valueRetrieved",
          "type": "string"
        }
      ],
      "name": "updateRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// Define contract address and provider
const ORACLE_CONTRACT_ADDRESS = process.env.ORACLE_CONTRACT_ADDRESS; // Replace with the contract address
const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_PROVIDER_ADDRESS); // Replace with the provider URL

// Define a wallet for signing transactions
const privateKey = process.env.PRIVATE_KEY; // Replace with the private key of the wallet
const wallet = new ethers.Wallet(privateKey, provider);

// Instantiate the contract
const oracleContract = new ethers.Contract(ORACLE_CONTRACT_ADDRESS, oracleABI, wallet);

// Function to create a new request
async function createRequest(urlToQuery, attributeToFetch) {
  try {
    const tx = await oracleContract.createRequest(urlToQuery, attributeToFetch);
    console.log("Transaction sent: ", tx.hash);
    await tx.wait();
    console.log("Request created successfully.");
  } catch (err) {
    console.error("Error creating request: ", err);
  }
}

// Function to simulate oracle response
async function respondToRequest(requestId, valueRetrieved) {
  try {
    const tx = await oracleContract.updateRequest(requestId, valueRetrieved);
    console.log("Transaction sent: ", tx.hash);
    await tx.wait();
    console.log(`Oracle responded to request ${requestId} with value: ${valueRetrieved}`);
  } catch (err) {
    console.error("Error responding to request: ", err);
  }
}

// Listen for NewRequest events and simulate off-chain processing
oracleContract.on("NewRequest", async (id, urlToQuery, attributeToFetch) => {
  console.log(`New Request Received - ID: ${id}, URL: ${urlToQuery}, Attribute: ${attributeToFetch}`);

  // Simulate fetching data from the URL and extracting the attribute
  // Replace this with actual off-chain logic to fetch and process data
  const simulatedValue = "SimulatedValue"; // Replace with actual retrieved value

  // Respond to the request
  await respondToRequest(id, simulatedValue);
});

// Listen for UpdatedRequest events
oracleContract.on("UpdatedRequest", (id, urlToQuery, attributeToFetch, agreedValue) => {
  console.log(`Request Updated - ID: ${id}, Agreed Value: ${agreedValue}`);
});

// Example usage
(async () => {
  // Create a new request (Example values provided)
  await createRequest("https://fakestoreapi.com/products/1", "id");
})();
