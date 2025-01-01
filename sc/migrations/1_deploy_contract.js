var FFP = artifacts.require("../contracts/FinancialFairPlayTransfers.sol");
var dotenv = require('dotenv');
dotenv.config();

module.exports = function (deployer, network) {
  deployer.deploy(FFP,process.env.SCAddress);
};