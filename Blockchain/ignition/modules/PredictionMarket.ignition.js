// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("PredictionMarketModule", (m) => {
  // Deploy the PredictionMarket contract
  const predictionMarket = m.contract("PredictionMarket");

  return {
    predictionMarket
  };
});
