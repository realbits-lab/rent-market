const { expect } = require("chai");
const { BigNumber } = require("ethers");
const {
  initializeBeforeEach,
  registerNFT,
  defaultRentFee,
  defaultFeeToken,
  defaultRentFeeByToken,
  defaultRentDuration,
} = require("./utility-function");

describe("test unregisterNFTData true case.", function () {
  /*****************************************************************************
   * Define variables.
   ****************************************************************************/
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
      testTokenContract,
    } = response);
  });

  it("test getAllRegisterData with one input data.", async function () {
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
     * Unregister NFT.
     **************************************************************************/
    let response = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .unregisterNFT(testNFTContract.address, startTokenId);

    /***************************************************************************
     * Get all registered NFT data after calling unregisterNFT.
     **************************************************************************/
    response = await rentMarketContract
      .connect(userSigner)
      .getAllRegisterData();

    /***************************************************************************
     * Compare the output data with input data.
     **************************************************************************/
    expect(response).to.be.empty;
  });

  it("test unregisterNFT emit event with nft owner call.", async function () {
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
     * Get emitted event.
     **************************************************************************/
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .unregisterNFT(testNFTContract.address, startTokenId)
    )
      .to.emit(rentMarketContract, "UnregisterNFT")
      .withArgs(
        testNFTContract.address,
        BigNumber.from(startTokenId),
        defaultRentFee,
        defaultFeeToken,
        defaultRentFeeByToken,
        defaultRentDuration,
        // NFT owner address.
        testNFTContractOwnerSigner.address,
        // unregisterNFT function caller address.
        testNFTContractOwnerSigner.address
      );
  });

  it("test unregisterNFT emit event with market owner call.", async function () {
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
     * Get emitted event.
     **************************************************************************/
    await expect(
      rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .unregisterNFT(testNFTContract.address, startTokenId)
    )
      .to.emit(rentMarketContract, "UnregisterNFT")
      .withArgs(
        testNFTContract.address,
        BigNumber.from(startTokenId),
        defaultRentFee,
        defaultFeeToken,
        defaultRentFeeByToken,
        defaultRentDuration,
        // NFT owner address.
        testNFTContractOwnerSigner.address,
        // unregisterNFT function caller address.
        rentMarketContractOwnerSigner.address
      );
  });
});
