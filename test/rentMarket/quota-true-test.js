const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test quota true case.", function () {
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

  it("test default getFreeQuota.", async function () {
    const renterFeeQuota = 35;
    const serviceFeeQuota = 35;
    const marketFeeQuota = 100 - renterFeeQuota - serviceFeeQuota;

    expect(
      await rentMarketContract.connect(userSigner).getFeeQuota()
    ).to.be.deep.equal([
      BigNumber.from(renterFeeQuota),
      BigNumber.from(serviceFeeQuota),
      BigNumber.from(marketFeeQuota),
    ]);
  });

  it("test setFreeQuota.", async function () {
    const renterFeeQuota = 10;
    const serviceFeeQuota = 20;
    const marketFeeQuota = 100 - renterFeeQuota - serviceFeeQuota;

    await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .setFeeQuota(renterFeeQuota, serviceFeeQuota, marketFeeQuota);

    expect(
      await rentMarketContract.connect(userSigner).getFeeQuota()
    ).to.be.deep.equal([
      BigNumber.from(renterFeeQuota),
      BigNumber.from(serviceFeeQuota),
      BigNumber.from(marketFeeQuota),
    ]);
  });
});
