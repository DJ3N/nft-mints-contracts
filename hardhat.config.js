/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-contract-sizer");
require('dotenv').config()

const HARMONY_PRIVATE_KEY = process.env.HARMONY_PRIVATE_KEY || '';

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    },
  },
  networks: {
    testnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [`0x${HARMONY_PRIVATE_KEY}`]
    },
    mainnet: {
      url: `https://harmony-0-rpc.gateway.pokt.network`,
      accounts: [`0x${HARMONY_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: {
      harmony: 'your API key'
    }
  }
};
