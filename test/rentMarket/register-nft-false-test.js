const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const { initializeBeforeEach, registerNFT } = require("./utility-function");

// TODO : Handle test error.
// AssertionError: Expected "RentNFT" event to have 1 argument(s), but it has 11
// If you test only this, no error happens, but if you test totally, error happens.
describe("test registerNFT false case.", function () {
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

  it("registerNFT with the false nftAddress input.", async function () {
    const startTokenId = 1;

    // 1. Register NFT to rent market.
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .registerNFT(ethers.constants.AddressZero, startTokenId)
    ).to.be.revertedWith("");
  });

  it("registerNFT with the false token ID input.", async function () {
    // 1. In initializeBeforeEach function, token was made to 10 token id.
    // - So, we set test token id to 100 for failure.
    const startTokenId = 100;

    // 2. Register NFT to rent market.
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .registerNFT(testNFTContract.address, startTokenId)
    ).to.be.revertedWith("");
  });

  it("registerNFT with the same multiple input.", async function () {
    const startTokenId = 1;
    const errorMessage = "RM2";

    // 2. Register NFT to rent market.
    const transaction = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .registerNFT(testNFTContract.address, startTokenId);
    await transaction.wait();

    // 2. Try to request register the same NFT againa.
    // - Should be reverted with error message.
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .registerNFT(testNFTContract.address, startTokenId)
    ).to.revertedWith(errorMessage);
  });

  it("registerNFT with a false owner.", async function () {
    const startTokenId = 1;
    const errorMessage = "RM4";

    // 1. Request register NFT to rent market with another account instead of owner.
    await expect(
      rentMarketContract
        .connect(userSigner)
        .registerNFT(testNFTContract.address, startTokenId)
    ).to.revertedWith(errorMessage);
  });
});
