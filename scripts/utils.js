const { ethers } = require("ethers");
const { task } = require("hardhat/config");
const { getContractAt } = require("@nomiclabs/hardhat-ethers/internal/helpers");

// Estimate gas to execute smart contract function.
task("estimateGasFee", "Estimate the gas fee to execute function.")
  .addParam("contract", "The contract name.")
  .setAction(async function (taskArguments, hre) {
    // Sample constructor argument data.
    const name = "testRentNft";
    const symbol = "TRN";
    const uri = "https://js-nft.s3.ap-northeast-2.amazonaws.com/json/";

    const nftContractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const estimatedGas = await hre.ethers.provider.estimateGas(
      nftContractFactory.getDeployTransaction(name, symbol, uri)
    );

    console.log("estimatedGas: ", estimatedGas);
  });

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("check-balance", "Prints out the balance of your account").setAction(
  async function (taskArguments, hre) {
    const account = getAccount();
    console.log(
      `Account balance for ${account.address}: ${await account.getBalance()}`
    );
  }
);

task("mineBlock", "Mine block.")
  .addParam("block", "The block count which is used for mining.")
  .setAction(async function (taskArguments, hre) {
    let currentBlock = await ethers.provider.getBlock("latest");
    console.log("currentBlock.number: ", currentBlock.number);

    const blockNumberHexString = parseInt(taskArguments.block).toString(16);
    console.log("blockNumberHexString: ", blockNumberHexString);
    response = await hre.ethers.provider.send("hardhat_mine", [
      `0x${blockNumberHexString}`,
    ]);

    console.log("response: ", response);

    currentBlock.number = await ethers.provider.getBlock("latest");
    console.log("currentBlock: ", currentBlock.number);
  });

// Helper method for fetching environment variables from .env
function getEnvVariable(key, defaultValue) {
  if (process.env[key]) {
    return process.env[key];
  }
  if (!defaultValue) {
    throw `${key} is not defined and no default value was provided`;
  }
  return defaultValue;
}

// Helper method for fetching a connection provider to the Ethereum network
function getProvider() {
  console.log("getEnvVariable/NETWORK: ", getEnvVariable("NETWORK"));
  if (getEnvVariable("NETWORK") === "localhost") {
    return ethers.getDefaultProvider("http://localhost:8545");
  } else {
    let alchemyKey;
    switch (getEnvVariable("NETWORK")) {
      case "ethereum":
        alchemyKey = "ALCHEMY_KEY_ETHEREUM";
        break;

      case "robsten":
        alchemyKey = "ALCHEMY_KEY_ROBSTEN";
        break;

      case "rinkeby":
        alchemyKey = "ALCHEMY_KEY_RINKEBY";
        break;

      case "matic":
        alchemyKey = "ALCHEMY_KEY_POLYGON";
        break;

      case "maticmum":
        alchemyKey = "ALCHEMY_KEY_MUMBAI";
        break;

      default:
        alchemyKey = "";
        break;
    }

    return new ethers.providers.AlchemyProvider(
      getEnvVariable("NETWORK"),
      getEnvVariable(alchemyKey)
    );
  }
}

// Helper method for fetching a wallet account using an environment variable for the PK
function getAccount() {
  return new ethers.Wallet(
    getEnvVariable("ACCOUNT_PRIVATE_KEY"),
    getProvider()
  );
}

// Helper method for fetching a contract instance at a given address
function getNFTContract(contractName, hre) {
  const account = getAccount();
  return getContractAt(
    hre,
    contractName,
    getEnvVariable("NFT_CONTRACT_ADDRESS"),
    account
  );
}

function getRentMarketContract(contractName, hre) {
  const account = getAccount();
  return getContractAt(
    hre,
    contractName,
    getEnvVariable("RENTMARKET_CONTRACT_ADDRESS"),
    account
  );
}

function isEmpty(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined ||
    (value != null && typeof value === "object" && !Object.keys(value).length)
  ) {
    return true;
  } else {
    return false;
  }
}

function changeIPFSToGateway(ipfsUrl) {
  if (
    typeof ipfsUrl === "string" &&
    ipfsUrl.length > 6 &&
    ipfsUrl.substring(0, 7) === "ipfs://"
  ) {
    const cidUrl = ipfsUrl.substring(7, ipfsUrl.length);
    // const gatewayUrl = "https://gateway.pinata.cloud/ipfs/" + cidUrl;
    const gatewayUrl = "https://nftstorage.link/ipfs/" + cidUrl;
    console.log("gatewayUrl: ", gatewayUrl);

    return gatewayUrl;
  } else {
    return ipfsUrl;
  }
}

module.exports = {
  getEnvVariable,
  getProvider,
  getAccount,
  getNFTContract,
  getRentMarketContract,
  isEmpty,
  changeIPFSToGateway,
};
