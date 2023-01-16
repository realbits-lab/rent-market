const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test unregisterNFT false case.", function () {
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

  it("test unregisterNFT with wrong nft address.", async function () {
    const startTokenId = 1;
    const endTokenId = 1;

    // 1. Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 2. call error because address is not a NFT address.
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .unregisterNFT(remainSignerArray[0].address, startTokenId)
    ).to.be.reverted;

    // 3. call error because address is not a NFT address.
    await expect(
      rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .unregisterNFT(remainSignerArray[0].address, startTokenId)
    ).to.be.reverted;
  });

  it("test unregisterNFT with wrong token ID.", async function () {
    const errorMessage = "RM5";
    const startTokenId = 1;
    const endTokenId = 1;
    const wrongTokenId = 100;

    // 1. Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 2. Get all registered NFT data after calling unregisterNFT.
    // - Can't unregister, because nftAddress is not matched.
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .unregisterNFT(testNFTContract.address, wrongTokenId)
    ).to.be.revertedWith(errorMessage);
  });

  it("unregisterNFT with wrong owner.", async function () {
    const errorMessage = "RM5";
    const startTokenId = 1;
    const endTokenId = 1;

    // 1. Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 2. Get all registered NFT data after calling unregisterNFT.
    // - Can't unregister, because nftAddress is not matched.
    await expect(
      rentMarketContract
        .connect(remainSignerArray[0].address)
        .unregisterNFT(testNFTContract.address, startTokenId)
    ).to.revertedWith(errorMessage);
  });
});
