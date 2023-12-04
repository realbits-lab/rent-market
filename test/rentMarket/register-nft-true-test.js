const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const {
  initializeBeforeEach,
  registerNFT,
  defaultRentFee,
  defaultFeeToken,
  defaultRentFeeByToken,
  defaultRentDuration,
} = require("./utility-function");

describe("test registerNFT true case.", function () {
  // Define variables.
  let // Signer values.
    rentMarketContractOwnerSigner,
    testNFTContractOwnerSigner,
    serviceContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // Contract values.
    rentMarketContract,
    testNFTContract,
    testNFTContract2,
    testTokenContract;

  beforeEach(async function () {
    /***************************************************************************
     * Initialize contract and data.
     * - Deploy smart contracts with fixture and mint NFT.
     * - Remove all data and register service and collection.
     * - Register token.
     * - Register collection.
     * - Register service.
     **************************************************************************/
    const response = await initializeBeforeEach();

    /***************************************************************************
     * Set each returned value.
     **************************************************************************/
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
      testNFTContract2,
      testTokenContract,
    } = response);
  });

  it("getAllRequestData function with single input data.", async function () {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    const startTokenId = 1;
    const endTokenId = 1;

    /***************************************************************************
     * Register NFT to rent market.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Get all registered NFT data.
     **************************************************************************/
    const response = await rentMarketContract
      .connect(userSigner)
      .getAllRegisterData();
    // console.log("response: ", response);

    /***************************************************************************
     * Compare the output data with input data.
     **************************************************************************/
    expect(response).to.deep.equal([
      [
        testNFTContract.address,
        BigNumber.from(startTokenId),
        defaultRentFee,
        defaultFeeToken,
        defaultRentFeeByToken,
        defaultRentDuration,
      ],
    ]);
  });

  it("getAllRegisterData function with multiple input data.", async function () {
    /***************************************************************************
     * Define variables.
     **************************************************************************/
    const startTokenId = 1;
    const endTokenId = 10;

    /***************************************************************************
     * Register NFT to rent market.
     **************************************************************************/
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    /***************************************************************************
     * Get all registered NFT data.
     **************************************************************************/
    const response = await rentMarketContract
      .connect(userSigner)
      .getAllRegisterData();

    /***************************************************************************
     * Compare the output data with input data.
     **************************************************************************/
    for (let i = startTokenId; i <= endTokenId; i++) {
      const idx = i - startTokenId;
      expect(response[idx]).to.deep.equal([
        testNFTContract.address,
        BigNumber.from(i),
        defaultRentFee,
        defaultFeeToken,
        defaultRentFeeByToken,
        defaultRentDuration,
      ]);
    }
  });

  it("getRegisterData function with nft address.", async function () {
    // Define variables.
    const startTokenId = 1;
    const endTokenId = 10;

    // Register test NFT to rent market from start to end token id.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // Register test2 NFT to rent market from start to end token id.
    // console.log("testNFTContract: ", testNFTContract);
    // console.log("testNFTContract.address: ", testNFTContract.address);
    // console.log("testNFTContract2: ", testNFTContract2);
    // console.log("testNFTContract2.address: ", testNFTContract2.address);
    await registerNFT({
      rentMarketContract,
      testNFTContract: testNFTContract2,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // Get all registered NFT data.
    const response = await rentMarketContract
      .connect(userSigner)
      .getRegisterDataByCollection(testNFTContract.address);

    // Check the response length.
    // console.log("response: ", response);
    expect(response.length, endTokenId - startTokenId + 1);

    // Compare the output data with input data.
    for (let i = startTokenId; i <= endTokenId; i++) {
      const idx = i - startTokenId;
      expect(response[idx]).to.deep.equal([
        testNFTContract.address,
        BigNumber.from(i),
        defaultRentFee,
        defaultFeeToken,
        defaultRentFeeByToken,
        defaultRentDuration,
      ]);
    }
  });
});
