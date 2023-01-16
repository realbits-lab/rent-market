const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test registerService true case.", function () {
  let // Signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentMarketContract,
    testNFTContract,
    testTokenContract;

  beforeEach(async function () {
    // 1. Initialize contract and data.
    // - 1-1. Deploy smart contracts with fixture and mint NFT.
    // - 1-2. Remove all data and register service and collection.
    // - 1-3. Register token.
    // - 1-4. Register collection.
    // - 1-5. Register service.
    const response = await initializeBeforeEach();
    // print({ response });

    // 2. Set each returned value.
    ({
      // Signer values.
      rentMarketContractOwnerSigner,
      testNFTContractOwnerSigner,
      serviceContractOwnerSigner,
      userSigner,
      remainSignerArray,
      // Contract values.
      rentMarketContract,
      testNFTContract,
      testTokenContract,
    } = response);
  });

  it("getAllService function with one input data.", async function () {
    let tx;

    // 1. Unregister all services.
    const allServiceArray = await rentMarketContract.getAllService();
    allServiceArray.forEach(async (element) => {
      await rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .unregisterService(element.serviceAddress);
    });

    // 2. Set input data.
    const serviceName = "testServiceName";
    const serviceAddress = remainSignerArray[0].address;

    // 3. Register service to rent market.
    // let estimateGas = await rentMarketContract.estimateGas.registerService(
    //   serviceAddress,
    //   serviceName
    // );
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .registerService(serviceAddress, serviceName, {
        gasPrice: ethers.utils.parseUnits("1", "kwei"),
        // block gas limit : 30000000
        gasLimit: 10000000,
      });
    await tx.wait();

    // 4. Get all registered NFT data.
    const response = await rentMarketContract
      .connect(userSigner)
      .getAllService();

    // 5. Compare the output data with input data.
    expect(response).to.deep.equal([[serviceAddress, serviceName]]);
  });

  it("getAllService function with multiple input data.", async function () {
    let tx;
    let response;

    // 1. Unregister all services.
    const allServiceArray = await rentMarketContract.getAllService();
    allServiceArray.forEach(async (element) => {
      await rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .unregisterService(element.serviceAddress);
    });

    // 2. Set input data.
    const TOTAL_COUNT = 5;
    let serviceAddressArray = [];
    let serviceNameArray = [];
    let txArray = [];
    for (let i = 0; i < TOTAL_COUNT; i++) {
      serviceAddressArray[i] = remainSignerArray[i].address;
      serviceNameArray[i] = `name: ${i}`;
    }

    // 3. Register service to rent market.
    for (let i = 0; i < TOTAL_COUNT; i++) {
      tx = await rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .registerService(serviceAddressArray[i], serviceNameArray[i], {
          gasPrice: ethers.utils.parseUnits("1", "kwei"),
          // block gas limit : 30000000
          gasLimit: 10000000,
        });
      txArray.push(tx.wait());
    }
    response = await Promise.all(txArray);

    // 4. Get all registered NFT data.
    response = await rentMarketContract.connect(userSigner).getAllService();

    // 5. Compare the output data with input data.
    for (let i = 0; i < TOTAL_COUNT; i++) {
      expect(response[i]).to.deep.equal([
        serviceAddressArray[i],
        serviceNameArray[i],
      ]);
    }
  });

  it("registerService function with emit event.", async function () {
    const serviceName = "testServiceName";
    const serviceAddress = remainSignerArray[0].address;

    // Request Register NFT.
    await expect(
      rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .registerService(serviceAddress, serviceName, {
          gasPrice: ethers.utils.parseUnits("1", "kwei"),
          // block gas limit : 30000000
          gasLimit: 10000000,
        })
    )
      .to.emit(rentMarketContract, "RegisterService")
      .withArgs(serviceAddress, serviceName);
  });
});
