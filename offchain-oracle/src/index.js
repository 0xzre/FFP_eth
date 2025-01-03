
// Import ethers.js
const { ethers } = require("ethers");
const dotenv = require('dotenv');
dotenv.config();

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

const ORACLE_CONTRACT_ADDRESS = process.env.ORACLE_CONTRACT_ADDRESS; 
const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_PROVIDER_ADDRESS);

const privateKey = process.env.PRIVATE_KEY; 
const wallet = new ethers.Wallet(privateKey, provider);

const oracleContract = new ethers.Contract(ORACLE_CONTRACT_ADDRESS, oracleABI, wallet);

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

oracleContract.on("NewRequest", async (id, urlToQuery, attributeToFetch) => {
  console.log(`New Request Received - ID: ${id}, URL: ${urlToQuery}, Attribute: ${attributeToFetch}`);

  const simulatedValue = "SimulatedValue";

  await respondToRequest(id, simulatedValue);
});

oracleContract.on("UpdatedRequest", (id, urlToQuery, attributeToFetch, agreedValue) => {
  console.log(`Request Updated - ID: ${id}, Agreed Value: ${agreedValue}`);
});

(async () => {
  await createRequest("https://localhost:3001", "value");
})();
