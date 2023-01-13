const { task } = require("hardhat/config");
const { getRentMarketContract, isEmpty } = require("./utils");

//------------------------------------------------------------------------------
//---------------------------------- CONSTRUCTOR -------------------------------
//------------------------------------------------------------------------------

task("exclusive", "Get exclusive bool flag.")
  .addParam("contract", "Contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.exclusive();
    console.log("exclusive: ", response);
  });

//------------------------------------------------------------------------------
//---------------------------------- TOKEN FLOW ------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// TOKEN GET/REMOVE FUNCTION
//------------------------------------------------------------------------------

task("getAllToken", "Get all token as array.")
  .addParam("contract", "Contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllToken();

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [tokenAddress, name] = response[i];

        console.log("----------------------------");
        // console.log(`index: ${i}`);
        console.log(`tokenAddress: ${tokenAddress}`);
        console.log(`name: ${name}`);
        console.log("----------------------------");
      }
    }
  });

task("removeToken", "Remove token.")
  .addParam("contract", "Contract name")
  .addParam("address", "Token address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.removeToken(taskArguments.address);

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      console.log(`response: ${response}`);
    }
  });

//------------------------------------------------------------------------------
// TOKEN REGISTER/UNREGISTER FUNCTION
//------------------------------------------------------------------------------

task("registerToken", "Register token")
  .addParam("contract", "Contract name")
  .addParam("address", "token contract address")
  .addParam("token", "token name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.registerToken(
      taskArguments.address,
      taskArguments.token,
      {
        gasPrice: hre.ethers.utils.parseUnits("500", "gwei"),
        // gasLimit: 500_000,
      }
    );

    console.log("response: ", response);
  });

task("unregisterToken", "Unregister token")
  .addParam("contract", "contract name")
  .addParam("address", "token contract address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.unregisterToken(taskArguments.address, {
      // gasPrice: hre.ethers.utils.parseUnits('50', 'gwei'),
      // gasLimit: 500_000,
    });

    console.log(`response: ${response}`);
  });

//------------------------------------------------------------------------------
//---------------------------------- COLLECTION FLOW ---------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// COLLECTION GET/REMOVE FUNCTION
//------------------------------------------------------------------------------

task("getAllCollection", "Get all collection as array.")
  .addParam("contract", "contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllCollection();

    if (isEmpty(response)) {
      console.log("No collection record.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [collectionAddress, uri] = response[i];

        console.log("----------------------------");
        // console.log(`index: ${i}`);
        console.log(`collectionAddress: ${collectionAddress}`);
        console.log(`collectionUri: ${uri}`);
        console.log("----------------------------");
      }
    }
  });

//------------------------------------------------------------------------------
// COLLECTION REGISTER/UNREGISTER FUNCTION
//------------------------------------------------------------------------------

task("registerCollection", "Register collection")
  .addParam("contract", "contract name")
  .addParam("address", "collection contract address")
  .addParam("uri", "collection uri")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.registerCollection(
      taskArguments.address,
      taskArguments.uri,
      {
        // gasPrice: hre.ethers.utils.parseUnits('50', 'gwei'),
        // gasLimit: 500_000,
      }
    );

    console.log(`response: ${response}`);
  });

task("unregisterCollection", "Unregister collection")
  .addParam("contract", "contract name")
  .addParam("address", "collection contract address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.unregisterCollection(
      taskArguments.address,
      {
        // gasPrice: hre.ethers.utils.parseUnits('50', 'gwei'),
        // gasLimit: 500_000,
      }
    );

    console.log(`response: ${response}`);
  });

//------------------------------------------------------------------------------
//---------------------------------- SERVICE FLOW ------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// SERVICE GET/REMOVE FUNCTION
//------------------------------------------------------------------------------

task("getAllService", "Get all service as array.")
  .addParam("contract", "contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllService();

    if (isEmpty(response)) {
      console.log("No service record.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [serviceAddress, uri] = response[i];

        console.log("----------------------------");
        // console.log(`index: ${i}`);
        console.log(`serviceAddress: ${serviceAddress}`);
        console.log(`serviceUri: ${uri}`);
        console.log("----------------------------");
      }
    }
  });

//------------------------------------------------------------------------------
// SERVICE REGISTER/UNREGISTER FUNCTION
//------------------------------------------------------------------------------

task("registerService", "Register service")
  .addParam("contract", "contract name")
  .addParam("address", "service contract address")
  .addParam("uri", "service uri")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.registerService(
      taskArguments.address,
      taskArguments.uri,
      {
        // gasPrice: hre.ethers.utils.parseUnits('50', 'gwei'),
        // gasLimit: 500_000,
      }
    );

    console.log(`response: ${response}`);
  });

task("unregisterService", "Unregister service")
  .addParam("contract", "contract name")
  .addParam("address", "service contract address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.unregisterService(taskArguments.address, {
      // gasPrice: hre.ethers.utils.parseUnits('50', 'gwei'),
      // gasLimit: 500_000,
    });

    console.log(`response: ${response}`);
  });

//------------------------------------------------------------------------------
//---------------------------------- NFT FLOW ----------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// NFT GET/REMOVE FUNCTION
//------------------------------------------------------------------------------

task("getAllRequestData", "Get all request data as array.")
  .addParam("contract", "rentMarket contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllRequestData();

    if (isEmpty(response)) {
      console.log("No request NFT data.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [nftAddress, tokenId] = response[i];

        console.log("----------------------------");
        // console.log(`index: ${i}`);
        console.log(`response[${i}]: `, response[i]);
        // console.log(`nftAddress: ${nftAddress}`);
        // console.log(`tokenId: ${tokenId}`);
        console.log("----------------------------");
      }
    }
  });

task("getRequestData", "Get request data from nft address and token ID.")
  .addParam("contract", "rentMarket contract name")
  .addParam("address", "nft address (with token parameter) or owner address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    let response;

    response = await contract.getRequestData(
      taskArguments.address,
      taskArguments.token
    );

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      const [nftAddress, tokenId] = response;

      console.log("----------------------------");
      console.log(`nftAddress: ${nftAddress}`);
      console.log(`tokenId: ${tokenId}`);
      console.log("----------------------------");
    }
  });

task("removeAllRequestData", "Remove all request data.")
  .addParam("contract", "contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.removeAllRequestData();

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      console.log(`response: ${response}`);
    }
  });

task("getAllRegisterData", "Get all register data as array.")
  .addParam("contract", "NFT name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllRegisterData();
    console.log("contract.address: ", contract.address);

    if (isEmpty(response)) {
      console.log("No register NFT data.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [
          nftAddress,
          tokenId,
          rentFee,
          feeTokenAddress,
          rentFeeByToken,
          rentDuration,
        ] = response[i];

        console.log("----------------------------");
        console.log(`index: ${i}`);
        console.log(`nftAddress: ${nftAddress}`);
        console.log(`tokenId: ${tokenId}`);
        console.log(`rentFee: ${rentFee / Math.pow(10, 18)} ether unit`);
        console.log(`feeTokenAddress: ${feeTokenAddress}`);
        console.log(
          `tokenIdrentFeeByToken ${
            rentFeeByToken / Math.pow(10, 18)
          } ether unit`
        );
        console.log(`rentDuration: ${rentDuration}`);
        console.log("----------------------------");
      }
    }
  });

task("getRegisterData", "Get register data from nft address and token ID.")
  .addParam("contract", "NFT name")
  .addParam("address", "nft address (with token parameter) or owner address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    let response;

    response = await contract.getRegisterData(
      taskArguments.address,
      taskArguments.token
    );

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      const [nftAddress, tokenId, rentFee, feeTokenAddress, rentFeeByToken] =
        response;

      console.log("----------------------------");
      console.log(`nftAddress: ${nftAddress}`);
      console.log(`tokenId: ${tokenId}`);
      console.log(`rentFee: ${rentFee}`);
      console.log(`feeTokenAddress: ${feeTokenAddress}`);
      console.log(`rentFeeByToken: ${rentFeeByToken}`);
      console.log("----------------------------");
    }
  });

task("removeAllRegisterData", "Remove all register data.")
  .addParam("contract", "contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.removeAllRegisterData();

    if (isEmpty(response)) {
      console.log("No register record from this owner address.");
    } else {
      console.log(`response: ${response}`);
    }
  });

//------------------------------------------------------------------------------
// NFT REQUEST/ACCEPT/CHANGE/UNREGISTER FUNCTION
//------------------------------------------------------------------------------

task("registerNFT", "Register NFT")
  .addParam("contract", "Contract name")
  .addParam("address", "NFT address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.registerNFT(
      taskArguments.address,
      taskArguments.token
    );

    console.log(`response: ${response}`);
  });

task("acceptRegisterNFT", "Accept request register NFT")
  .addParam("contract", "Contract name")
  .addParam("address", "NFT address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.acceptRegisterNFT(
      taskArguments.address,
      taskArguments.token
    );

    console.log(`response: ${response}`);
  });

task("changeNFT", "Change NFT.")
  .addParam("contract", "rentMarket contract name")
  .addParam("address", "nftAddress")
  .addParam("token", "token ID")
  .addParam("taddress", "Fee token address")
  .addParam("fee", "Rent fee by token")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const element = await contract.getRegisterData(
      taskArguments.address,
      taskArguments.token
    );
    console.log("element: ", element);
    const response = await contract.changeNFT(
      taskArguments.address,
      taskArguments.token,
      element["rentFee"],
      taskArguments.taddress,
      taskArguments.fee,
      element["rentDuration"]
    );

    console.log(`response: ${response}`);
  });

task("unregisterNFT", "Unregister NFT to rentMarket")
  .addParam("contract", "NFT name")
  .addParam("address", "NFT address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.unregisterNFT(
      taskArguments.address,
      taskArguments.token,
      {
        // gasPrice: hre.ethers.utils.parseUnits('50', 'gwei'),
        // gasLimit: 500_000,
      }
    );

    console.log(`response: ${response}`);
  });

//------------------------------------------------------------------------------
//---------------------------------- RENT FLOW ---------------------------------
//------------------------------------------------------------------------------

task("getFeeQuota", "Get each fee quota.")
  .addParam("contract", "rentMarket contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getFeeQuota();

    console.log(`response: ${response}`);
  });

//------------------------------------------------------------------------------
// RENT GET/REMOVE FUNCTION
//------------------------------------------------------------------------------

task("getAllRentData", "Get all rented NFT.")
  .addParam("contract", "rentMarket contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllRentData();

    if (isEmpty(response)) {
      console.log("No rent record.");
    } else {
      // console.log(`response: |${response}|`);
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [
          nftAddress,
          tokenId,
          rentFee,
          feeTokenAddress,
          rentFeeByToken,
          isRentByToken,
          rentDurationBlock,
          renterAddress,
          renteeAddress,
          serviceAddress,
          rentStartTimestamp,
        ] = response[i];

        console.log("----------------------------");
        console.log(`index: ${i}`);
        console.log(`nftAddress: ${nftAddress}`);
        console.log(`tokenId: ${tokenId}`);
        console.log(`rentFee: ${rentFee / Math.pow(10, 18)} ether unit`);
        console.log(`feeTokenAddress: ${feeTokenAddress}`);
        console.log(
          `rentFeeByToken: ${rentFeeByToken / Math.pow(10, 18)} ether unit`
        );
        console.log(`isRentByToken: ${isRentByToken}`);
        console.log(`rentDurationBlock: ${rentDurationBlock}`);
        console.log(`renterAddress: ${renterAddress}`);
        console.log(`renteeAddress: ${renteeAddress}`);
        console.log(`serviceAddress: ${serviceAddress}`);
        console.log(`rentStartTimestamp: ${rentStartTimestamp}`);
        console.log("----------------------------");
      }
    }
  });

task("getRentData", "Get all rented NFT data with rent owner's address.")
  .addParam("contract", "rentMarket contract name")
  .addParam("address", "rent NFT owner's address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getRentData(taskArguments.address);

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      // console.log(`response: |${response}|`);
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [
          nftAddress,
          tokenId,
          rentFee,
          feeTokenAddress,
          rentFeeByToken,
          isRentByToken,
          rentDurationBlock,
          renterAddress,
          renteeAddress,
          serviceAddress,
          rentStartTimestamp,
        ] = response[i];

        console.log("----------------------------");
        console.log(`index: ${i}`);
        console.log(`nftAddress: ${nftAddress}`);
        console.log(`tokenId: ${tokenId}`);
        console.log(`rentFee: ${rentFee / Math.pow(10, 18)} ether unit`);
        console.log(`feeTokenAddress: ${feeTokenAddress}`);
        console.log(
          `rentFeeByToken: ${rentFeeByToken / Math.pow(10, 18)} ether unit`
        );
        console.log(`isRentByToken: ${isRentByToken}`);
        console.log(`rentDurationBlock: ${rentDurationBlock}`);
        console.log(`renterAddress: ${renterAddress}`);
        console.log(`renteeAddress: ${renteeAddress}`);
        console.log(`serviceAddress: ${serviceAddress}`);
        console.log(`rentStartTimestamp: ${rentStartTimestamp}`);
        console.log("----------------------------");
      }
    }
  });

task("removeAllRentData", "Remove all rent data.")
  .addParam("contract", "rentMarket contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.removeAllRentData();

    if (isEmpty(response)) {
      console.log("No rent record from this owner address.");
    } else {
      console.log(`response: ${response}`);
    }
  });

//------------------------------------------------------------------------------
// RENT RENT/RENTBYTOKEN/UNRENT FUNCTION
//------------------------------------------------------------------------------

task("rentNFT", "Rent NFT from rentMarket")
  .addParam("contract", "Contract name")
  .addParam("address", "NFT address")
  .addParam("token", "Token ID")
  .addParam("service", "Service address")
  .addParam("fee", "rent fee")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.rentNFT(
      taskArguments.address,
      taskArguments.token,
      taskArguments.service,
      {
        // value: ethers.utils.parseEther("0.001"),
        //                                    1 Ether = 1,000,000,000,000,000,000 WEI = 1 (EXA)WEI
        //               1 (MILLI)ETHER = 0.001 ETHER = 1,000,000,000,000,000 WEI = 1 (PETA)WEI
        //            1 (MICRO)ETHER = 0.000001 ETHER = 1,000,000,000,000 WEI = 1 (TERA)WEI
        //          1 (Nano)ETHER = 0.000000001 ETHER = 1,000,000,000 WEI = 1 (GIGA)WEI
        //       1 (PICO)ETHER = 0.000000000001 ETHER = 1,000,000 WEI = 1 (MEGA)WEI
        //   1 (FEMTO)ETHER = 0.000000000000001 ETHER = 1,000 WEI = 1 (KILO)WEI
        // 1 (ATTO)ETHER = 0.000000000000000001 ETHER = 1 WEI

        value: hre.ethers.utils.parseUnits(taskArguments.fee, "ether"),
        // gasPrice: hre.ethers.utils.parseUnits("50", "gwei"),
        // gasLimit: 500_000,
      }
    );

    console.log(`response: ${response}`);
  });

task("unrentNFT", "Unrent NFT from rentMarket")
  .addParam("contract", "Contract name")
  .addParam("address", "NFT address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.unrentNFT(
      taskArguments.address,
      taskArguments.token
    );

    console.log("response: ", response);
  });

//------------------------------------------------------------------------------
//---------------------------------- SETTLE FLOW -------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// SETTLE EVENT
//------------------------------------------------------------------------------

task("settleRentData", "Settle rent data.")
  .addParam("contract", "rentMarket contract name")
  .addParam("address", "NFT address")
  .addParam("token", "Token ID")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    // console.log("contract: ", contract);
    const response = await contract.settleRentData(
      taskArguments.address,
      taskArguments.token,
      {
        gasPrice: hre.ethers.utils.parseUnits("500", "gwei"),
        gasLimit: 5_000_000,
      }
    );

    console.log("response: ", response);
  });

task("owner", "Get rentMarket owner.")
  .addParam("contract", "rentMarket contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.owner({
      gasPrice: hre.ethers.utils.parseUnits("500", "gwei"),
      gasLimit: 500_000,
    });

    console.log("response: ", response);
  });

//------------------------------------------------------------------------------
//---------------------------------- WITHDRAW FLOW -------------------------------
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// WITHDRAW EVENT
//------------------------------------------------------------------------------

task("getAllPendingRentFee", "Get all pending rent fee data.")
  .addParam("contract", "Contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllPendingRentFee();

    if (isEmpty(response)) {
      console.log("No pending rent fee data.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        const [renterAddress, serviceAddress, feeTokenAddress, amount] =
          response[i];

        console.log("----------------------------");
        // console.log(`index: ${i}`);
        console.log(`renterAddress: ${renterAddress}`);
        console.log(`serviceAddress: ${serviceAddress}`);
        console.log(`feeTokenAddress: ${feeTokenAddress}`);
        console.log(`amount: ${amount / Math.pow(10, 18)}`);
        console.log("----------------------------");
      }
    }
  });

task("getAllAccountBalance", "Get all account balance.")
  .addParam("contract", "Contract name")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.getAllAccountBalance();

    if (isEmpty(response)) {
      console.log("No account balance data.");
    } else {
      console.log(`response.length: |${response.length}|`);

      for (let i = 0; i < response.length; i++) {
        // struct accountBalance {
        //     address accountAddress;
        //     address tokenAddress;
        //     uint256 amount;
        // }
        const [accountAddress, tokenAddress, amount] = response[i];

        console.log("----------------------------");
        // console.log(`index: ${i}`);
        console.log(`accountAddress: ${accountAddress}`);
        console.log(`tokenAddress: ${tokenAddress}`);
        console.log(`amount: ${amount / Math.pow(10, 18)}`);
        console.log("----------------------------");
      }
    }
  });

task("isOwnerOrRenter", "Check account is owner or renter.")
  .addParam("contract", "The NFT contract name.")
  .addParam("account", "The account address.")
  .setAction(async function (taskArguments, hre) {
    const contract = await getRentMarketContract(taskArguments.contract, hre);
    const response = await contract.isOwnerOrRenter(taskArguments.account);
    console.log("response: ", response);
  });
