require('dotenv').config();

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      network_id: '*',
      host: 'localhost',
      port: process.env.PORT
    }
  },
  compilers: {
    solc: {
      version: "0.8.20"
    }
  }
};