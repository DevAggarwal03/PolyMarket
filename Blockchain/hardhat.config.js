require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    seiTestnet: {
      url: "https://evm-rpc-testnet.sei-apis.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
