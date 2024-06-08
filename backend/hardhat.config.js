require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()
const SEPOLIA_RPC_URL = `${process.env.SEPOLIA_RPC_URL}`
const PRIVATE_KEY = `${process.env.PRIVATE_KEY}`
const PRIVATE_KEY_2 = `${process.env.PRIVATE_KEY_2}`
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat:{},
    sepolia:{
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_2],
      chainId: 11155111
    }
  },
  solidity: "0.8.24",
};
