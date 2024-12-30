var FFP = artifacts.require("../contracts/FinancialFairPlayTransfers.sol");

module.exports = function (deployer, network) {
  deployer.deploy(FFP,"0x1fa272829f1ee075c21a60ea4237867fb881de31");
};