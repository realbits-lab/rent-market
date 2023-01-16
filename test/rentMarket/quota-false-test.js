const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test quota false case.", function () {
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

  it("test setFreeQuota when sum is over 100.", async function () {
    const errorMessage = "RM12";

    await expect(
      rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .setFeeQuota(10, 20, 80)
    ).to.be.revertedWith(errorMessage);
  });

  it("test setFreeQuota when sum is under 100.", async function () {
    const errorMessage = "RM12";

    await expect(
      rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .setFeeQuota(10, 20, 50)
    ).to.be.revertedWith(errorMessage);
  });
});
