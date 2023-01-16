const { expect } = require("chai");
const { ethers } = require("hardhat");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test registerService false case.", function () {
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

  it("getService with the false serviceAddress input.", async function () {
    let tx;

    // 1. Set input data.
    const serviceName = "testServiceName";
    const serviceAddress = remainSignerArray[0].address;

    // 2. Request register NFT to rent market.
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .registerService(serviceAddress, serviceName);
    await tx.wait();

    // 3. Input renterAddress instead of nftAddress for false case.
    const response = await rentMarketContract
      .connect(userSigner)
      .getService(ethers.constants.AddressZero);

    // 4. Compare the output data with input data.
    expect(response).to.not.deep.equal([serviceAddress, serviceName]);
  });
});
