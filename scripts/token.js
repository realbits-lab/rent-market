const { task } = require("hardhat/config");
const axios = require("axios");
const {
  decrypt,
  decryptSafely,
  encrypt,
  encryptSafely,
  getEncryptionPublicKey,
} = require("@metamask/eth-sig-util");
const { getContractAt } = require("@nomiclabs/hardhat-ethers/internal/helpers");
const {
  getNFTContract,
  changeIPFSToGateway,
  getEnvVariable,
  getAccount,
} = require("./utils");

task("deployRewardTokenContract", "Deploys the rewardToken contract")
  .addParam("contract", "The contract name")
  .addParam("name", "The token name")
  .addParam("symbol", "The token symbol")
  .addParam("share", "The share contract of the reward token")
  .addParam("team", "The project team account address")
  .setAction(async function (taskArguments, hre) {
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const response = await contractFactory.deploy(
      taskArguments.name,
      taskArguments.symbol,
      taskArguments.share,
      taskArguments.team,
      {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        // gasLimit: hre.ethers.utils.parseUnits("70", "gwei"),
      }
    );

    console.log("Contract address: ", response.address);
  });

task("deployRewardTokenShareContract", "Deploys the rewardTokenShare contract")
  .addParam("contract", "The contract name")
  .addParam("team", "The project team account address")
  .setAction(async function (taskArguments, hre) {
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const response = await contractFactory.deploy(taskArguments.team, {
      // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      // gasLimit: hre.ethers.utils.parseUnits("70", "gwei"),
    });

    console.log("Contract address: ", response.address);
  });

task(
  "getRewardTokenBalance",
  "Get reward token balance of reward token share contract"
)
  .addParam("contract", "The contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContractAt(
      hre,
      taskArguments.contract,
      getEnvVariable("REWARD_TOKEN_SHARE_CONTRACT_ADDRESS"),
      getAccount()
    );
    // console.log("contract: ", contract);
    const response = await contract.getRewardTokenBalance();
    console.log("response: ", response);
  });

task("setRewardTokenContractAddress", "Set reward token contract address")
  .addParam("contract", "The contract name")
  .addParam("address", "The reward token address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContractAt(
      hre,
      taskArguments.contract,
      getEnvVariable("REWARD_TOKEN_SHARE_CONTRACT_ADDRESS"),
      getAccount()
    );
    // console.log("contract: ", contract);
    const response = await contract.setRewardTokenContractAddress(
      taskArguments.address
    );
    console.log("response: ", response);
  });

task("getRewardTokenContractAddress", "Get reward token contract address")
  .addParam("contract", "The contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContractAt(
      hre,
      taskArguments.contract,
      getEnvVariable("REWARD_TOKEN_SHARE_CONTRACT_ADDRESS"),
      getAccount()
    );
    // console.log("contract: ", contract);
    const tx = await contract.getRewardTokenContractAddress();
    console.log("tx.hash: ", tx.hash);
  });

task("addRentMarketContractAddress", "Add rent market contract address")
  .addParam("contract", "The contract name")
  .addParam("address", "The rent market contract address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContractAt(
      hre,
      taskArguments.contract,
      getEnvVariable("REWARD_TOKEN_SHARE_CONTRACT_ADDRESS"),
      getAccount()
    );
    // console.log("contract: ", contract);
    const tx = await contract.addRentMarketContractAddress(
      taskArguments.address
    );
    console.log("tx.hash: ", tx.hash);
  });

task("removeRentMarketContractAddress", "Remove rent market contract address")
  .addParam("contract", "The contract name")
  .addParam("address", "The rent market contract address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContractAt(
      hre,
      taskArguments.contract,
      getEnvVariable("REWARD_TOKEN_SHARE_CONTRACT_ADDRESS"),
      getAccount()
    );
    // console.log("contract: ", contract);
    const tx = await contract.removeRentMarketContractAddress(
      taskArguments.address
    );
    console.log("tx.hash: ", tx.hash);
  });
