require('@nomicfoundation/hardhat-toolbox');
require('@openzeppelin/hardhat-upgrades');

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "0g-testnet": {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16602,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    },
    "0g-mainnet": {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "0g-testnet": "placeholder",
      "0g-mainnet": "placeholder",
    },
    customChains: [
      {
        network: "0g-testnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        network: "0g-mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/open/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
};
