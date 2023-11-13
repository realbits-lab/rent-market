const { task } = require("hardhat/config");
const { getAccount } = require("./utils");

// Estimate gas to deploy rentNFT contract.
task("estimateGasFeeToDeployRentNFT", "Estimate the gas fee to deploy rentNFT.")
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

// Estimate gas to deploy promptNFT contract.
task(
  "estimateGasFeeToDeployPromptNFT",
  "Estimate the gas fee to deploy promptNFT."
)
  .addParam("contract", "The contract name.")
  .setAction(async function (taskArguments, hre) {
    // Sample constructor argument data.
    const name = "testRentNft";
    const symbol = "TRN";
    const uri = "https://js-nft.s3.ap-northeast-2.amazonaws.com/json/";
    const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    const nftContractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const estimatedGas = await hre.ethers.provider.estimateGas(
      nftContractFactory.getDeployTransaction(name, symbol, uri, address)
    );

    console.log("estimatedGas: ", estimatedGas);
  });

// Estimate gas to deploy rentMarket contract.
task(
  "estimateGasFeeToDeployRentMarket",
  "Estimate the gas fee to deploy rentMarket."
)
  .addParam("contract", "The contract name.")
  .setAction(async function (taskArguments, hre) {
    // Deploy iterableMap library smart contract.
    console.log("Try to deploy a pendingRentFeeIterableMap.");
    const pendingRentFeeIterableMapContract =
      await hre.ethers.getContractFactory("pendingRentFeeIterableMap");
    const pendingRentFeeIterableMapLibrary =
      await pendingRentFeeIterableMapContract.deploy();

    console.log("Try to deploy a tokenDataIterableMap.");
    const tokenDataIterableMapContract = await hre.ethers.getContractFactory(
      "tokenDataIterableMap"
    );
    const tokenDataIterableMapLibrary =
      await tokenDataIterableMapContract.deploy();

    console.log("Try to deploy a accountBalanceIterableMap.");
    const accountBalanceIterableMapContract =
      await hre.ethers.getContractFactory("accountBalanceIterableMap");
    const accountBalanceIterableMapLibrary =
      await accountBalanceIterableMapContract.deploy();

    console.log("Try to deploy a collectionDataIterableMap.");
    const collectionDataIterableMapContract =
      await hre.ethers.getContractFactory("collectionDataIterableMap");
    const collectionDataIterableMapLibrary =
      await collectionDataIterableMapContract.deploy();

    console.log("Try to deploy a serviceDataIterableMap.");
    const serviceDataIterableMapContract = await hre.ethers.getContractFactory(
      "serviceDataIterableMap"
    );
    const serviceDataIterableMapLibrary =
      await serviceDataIterableMapContract.deploy();

    console.log("Try to deploy a registerDataIterableMap.");
    const registerDataIterableMapContract = await hre.ethers.getContractFactory(
      "registerDataIterableMap"
    );
    const registerDataIterableMapLibrary =
      await registerDataIterableMapContract.deploy();

    console.log("Try to deploy a rentDataIterableMap.");
    const rentDataIterableMapContract = await hre.ethers.getContractFactory(
      "rentDataIterableMap"
    );
    const rentDataIterableMapLibrary =
      await rentDataIterableMapContract.deploy();

    // Wait all deployments.
    console.log("Wait all deployments.");
    await pendingRentFeeIterableMapLibrary.deployed();
    await tokenDataIterableMapLibrary.deployed();
    await accountBalanceIterableMapLibrary.deployed();
    await collectionDataIterableMapLibrary.deployed();
    await serviceDataIterableMapLibrary.deployed();
    await registerDataIterableMapLibrary.deployed();
    await rentDataIterableMapLibrary.deployed();

    // Deploy rentMarket smart contract.
    console.log("Try to get a rentMarketContract.");
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      {
        libraries: {
          pendingRentFeeIterableMap:
            pendingRentFeeIterableMapLibrary.deployTransaction.creates,
          tokenDataIterableMap:
            tokenDataIterableMapLibrary.deployTransaction.creates,
          accountBalanceIterableMap:
            accountBalanceIterableMapLibrary.deployTransaction.creates,
          collectionDataIterableMap:
            collectionDataIterableMapLibrary.deployTransaction.creates,
          serviceDataIterableMap:
            serviceDataIterableMapLibrary.deployTransaction.creates,
          registerDataIterableMap:
            registerDataIterableMapLibrary.deployTransaction.creates,
          rentDataIterableMap:
            rentDataIterableMapLibrary.deployTransaction.creates,
        },
      }
    );

    console.log("Try to get an estimated gas fee.");
    const estimatedGas = await hre.ethers.provider.estimateGas(
      contractFactory.getDeployTransaction()
    );

    console.log("estimatedGas: ", estimatedGas);
  });

// Deploy a normal contract.
task("deployRentNftContract", "Deploys the rentNFT contract")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("name", "The contract name to be deployed.")
  .addParam("symbol", "The contract name to be deployed.")
  .addParam("uri", "The base uri of nft.")
  .setAction(async function (taskArguments, hre) {
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const response = await contractFactory.deploy(
      taskArguments.name,
      taskArguments.symbol,
      taskArguments.uri,
      {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        // gasLimit: hre.ethers.utils.parseUnits("70", "gwei"),
      }
    );

    // console.log("response.deployTransaction: ", response.deployTransaction);
    console.log("Contract deployed to address: ", response.address);
  });

// Deploy a payment NFT contract.
task("deployPaymentNftContract", "Deploys the paymentNFT contract")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("name", "The contract name to be deployed.")
  .addParam("symbol", "The contract name to be deployed.")
  .addParam("uri", "The base uri of nft.")
  .setAction(async function (taskArguments, hre) {
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const response = await contractFactory.deploy(
      taskArguments.name,
      taskArguments.symbol,
      taskArguments.uri,
      {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        // gasLimit: hre.ethers.utils.parseUnits("70", "gwei"),
      }
    );

    // console.log("response.deployTransaction: ", response.deployTransaction);
    console.log("Contract deployed to address: ", response.address);
  });

// Deploy a prompt nft contract.
task("deployPromptNftContract", "Deploys the promptNFT contract")
  .addParam("contract", "The contract name to be deployed.")
  .addParam("name", "The contract name to be deployed.")
  .addParam("symbol", "The contract name to be deployed.")
  .addParam("address", "The address of rentMarket contract.")
  .setAction(async function (taskArguments, hre) {
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      getAccount()
    );
    const response = await contractFactory.deploy(
      taskArguments.name,
      taskArguments.symbol,
      taskArguments.address,
      {
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        // gasLimit: hre.ethers.utils.parseUnits("70", "gwei"),
      }
    );

    console.log("Contract deployed to address: ", response.address);
  });

//* Deploy a rentMarket contract with iterableMap libraries.
task("deployRentMarket", "Deploy the rentMarket contract")
  .addParam("contract", "The contract name to be deployed.")
  .setAction(async function (taskArguments, hre) {
    //* Deploy iterableMap library smart contract.
    console.log("Try to deploy a pendingRentFeeIterableMap.");
    const pendingRentFeeIterableMapContract =
      await hre.ethers.getContractFactory("pendingRentFeeIterableMap");
    const pendingRentFeeIterableMapLibrary =
      await pendingRentFeeIterableMapContract.deploy();

    console.log("Try to deploy a tokenDataIterableMap.");
    const tokenDataIterableMapContract = await hre.ethers.getContractFactory(
      "tokenDataIterableMap"
    );
    const tokenDataIterableMapLibrary =
      await tokenDataIterableMapContract.deploy();

    console.log("Try to deploy a accountBalanceIterableMap.");
    const accountBalanceIterableMapContract =
      await hre.ethers.getContractFactory("accountBalanceIterableMap");
    const accountBalanceIterableMapLibrary =
      await accountBalanceIterableMapContract.deploy();

    console.log("Try to deploy a collectionDataIterableMap.");
    const collectionDataIterableMapContract =
      await hre.ethers.getContractFactory("collectionDataIterableMap");
    const collectionDataIterableMapLibrary =
      await collectionDataIterableMapContract.deploy();

    console.log("Try to deploy a serviceDataIterableMap.");
    const serviceDataIterableMapContract = await hre.ethers.getContractFactory(
      "serviceDataIterableMap"
    );
    const serviceDataIterableMapLibrary =
      await serviceDataIterableMapContract.deploy();

    console.log("Try to deploy a registerDataIterableMap.");
    const registerDataIterableMapContract = await hre.ethers.getContractFactory(
      "registerDataIterableMap"
    );
    const registerDataIterableMapLibrary =
      await registerDataIterableMapContract.deploy();

    console.log("Try to deploy a rentDataIterableMap.");
    const rentDataIterableMapContract = await hre.ethers.getContractFactory(
      "rentDataIterableMap"
    );
    const rentDataIterableMapLibrary =
      await rentDataIterableMapContract.deploy();

    console.log("Try to deploy a utilFunctions.");
    const utilFunctionsContract = await hre.ethers.getContractFactory(
      "utilFunctions"
    );
    const utilFunctionsLibrary = await utilFunctionsContract.deploy();

    //* Wait all deployments.
    console.log("Wait all deployments.");
    await pendingRentFeeIterableMapLibrary.deployed();
    await tokenDataIterableMapLibrary.deployed();
    await accountBalanceIterableMapLibrary.deployed();
    await collectionDataIterableMapLibrary.deployed();
    await serviceDataIterableMapLibrary.deployed();
    await registerDataIterableMapLibrary.deployed();
    await rentDataIterableMapLibrary.deployed();
    await utilFunctionsLibrary.deployed();

    //* Deploy rentMarket smart contract.
    console.log("Try to get a rentMarketContract.");
    const contractFactory = await hre.ethers.getContractFactory(
      taskArguments.contract,
      {
        libraries: {
          pendingRentFeeIterableMap:
            pendingRentFeeIterableMapLibrary.deployTransaction.creates,
          tokenDataIterableMap:
            tokenDataIterableMapLibrary.deployTransaction.creates,
          accountBalanceIterableMap:
            accountBalanceIterableMapLibrary.deployTransaction.creates,
          collectionDataIterableMap:
            collectionDataIterableMapLibrary.deployTransaction.creates,
          serviceDataIterableMap:
            serviceDataIterableMapLibrary.deployTransaction.creates,
          registerDataIterableMap:
            registerDataIterableMapLibrary.deployTransaction.creates,
          rentDataIterableMap:
            rentDataIterableMapLibrary.deployTransaction.creates,
          utilFunctions: utilFunctionsLibrary.deployTransaction.creates,
        },
      }
    );

    console.log("Try to deploy a rentMarketContract.");
    let rentMarketContract;
    rentMarketContract = await contractFactory.deploy({
      // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
      // gasLimit: hre.ethers.utils.parseUnits("100", "gwei"),
    });

    console.log(`Contract deployed to address: ${rentMarketContract.address}`);
  });

// https://rubydusa.medium.com/parsererror-multiple-spdx-license-identifiers-found-in-source-file-de4d61ffab64
task(
  "flat",
  "Flattens and prints contracts and their dependencies (Resolves licenses)"
)
  .addOptionalVariadicPositionalParam(
    "files",
    "The files to flatten",
    undefined,
    types.inputFile
  )
  .setAction(async ({ files }, hre) => {
    let flattened = await hre.run("flatten:get-flattened-sources", { files });

    // Remove every line started with "// SPDX-License-Identifier:"
    flattened = flattened.replace(
      /SPDX-License-Identifier:/gm,
      "License-Identifier:"
    );
    flattened = `// SPDX-License-Identifier: MIXED\n\n${flattened}`;

    // Remove every line started with "pragma experimental ABIEncoderV2;" except the first one
    flattened = flattened.replace(
      /pragma experimental ABIEncoderV2;\n/gm,
      (
        (i) => (m) =>
          !i++ ? m : ""
      )(0)
    );
    console.log(flattened);
  });
