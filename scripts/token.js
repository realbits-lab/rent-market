const { task } = require("hardhat/config");
const axios = require("axios");
const {
  decrypt,
  decryptSafely,
  encrypt,
  encryptSafely,
  getEncryptionPublicKey,
} = require("@metamask/eth-sig-util");
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
