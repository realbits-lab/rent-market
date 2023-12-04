require("dotenv").config({ path: __dirname + "/.env" });
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("solidity-docgen");
require('hardhat-contract-sizer');
// require("hardhat-ethernal");

require("./scripts/deploy.js");
require("./scripts/nft.js");
require("./scripts/rentmarket.js");
require("./scripts/token.js");

const {
  ALCHEMY_KEY_ETHEREUM,
  ALCHEMY_KEY_ROBSTEN,
  ALCHEMY_KEY_RINKEBY,
  ALCHEMY_KEY_POLYGON,
  ALCHEMY_KEY_MUMBAI,
  ACCOUNT_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  NETWORK,
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  mocha: {
    timeout: 100000000,
  },
  ethernal: {
    email: process.env.ETHERNAL_EMAIL,
    password: process.env.ETHERNAL_PASSWORD,
  },
  docgen: {
    root: process.cwd(),
    sourcesDir: "contracts",
    // 'single' | 'items' | 'files'
    outputDir: "../realbits-doc.github.io/_collections/_chapters/solidity",
    pages: "files",
    exclude: [],
    theme: "markdown",
    collapseNewlines: true,
    pageExtension: ".md",
    // templates: "./docs",
  },
  defaultNetwork: NETWORK,
  // Use default path.
  paths: {
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      // https://hardhat.org/metamask-issue
      chainId: 1337,
      // https://hardhat.org/hardhat-network/reference#mining-modes
      mining: {
        auto: true,
        // interval: 5000,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_KEY_RINKEBY}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_KEY_ROBSTEN}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    matic: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY_POLYGON}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    maticmum: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_KEY_MUMBAI}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    ethereum: {
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY_ETHEREUM}`,
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
  etherscan: {
    // apiKey: ETHERSCAN_API_KEY,
    apiKey: POLYGONSCAN_API_KEY,
  },
};
