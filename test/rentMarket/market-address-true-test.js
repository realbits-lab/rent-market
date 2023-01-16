const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test setMarketShareAddress function case.", function () {
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

  it("test default market share address should be this contract.", async function () {
    let tx;
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .setMarketShareAddress(remainSignerArray[0].address);
    await tx.wait();

    expect(
      await rentMarketContract.connect(userSigner).getMarketShareAddress()
    ).to.be.equal(remainSignerArray[0].address);
  });
});
