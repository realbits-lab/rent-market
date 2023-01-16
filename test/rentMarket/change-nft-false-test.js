const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test changeNFT false case.", function () {
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
    // * -----------------------------------------------------------------------
    // * Initialize contract and data.
    // * - Deploy smart contracts with fixture and mint NFT.
    // * - Remove all data and register service and collection.
    // * - Register token.
    // * - Register collection.
    // * - Register service.
    // * -----------------------------------------------------------------------
    const response = await initializeBeforeEach();
    // print({ response });

    // * -----------------------------------------------------------------------
    // * Set each returned value.
    // * -----------------------------------------------------------------------
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

  it("test changeNFT with wrong nftAddress.", async function () {
    // * -----------------------------------------------------------------------
    // * Define variables.
    // * -----------------------------------------------------------------------
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;
    let rentFee = BigNumber.from(2);
    let rentDuration = BigNumber.from(500);
    let rentFeeByToken = BigNumber.from(5);
    const serviceName = "testServiceName";

    // * -----------------------------------------------------------------------
    // * Register NFT to rent market.
    // * -----------------------------------------------------------------------
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // * -----------------------------------------------------------------------
    // * Register token to rent market.
    // * -----------------------------------------------------------------------
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .registerToken(remainSignerArray[0].address, serviceName);
    await tx.wait();

    // * -----------------------------------------------------------------------
    // * Input wrong token contarct address with remainSignerArray[0].address.
    // * -----------------------------------------------------------------------
    await expect(
      rentMarketContract
        .connect(rentMarketContractOwnerSigner)
        .changeNFT(
          remainSignerArray[0].address,
          startTokenId,
          rentFee,
          remainSignerArray[0].address,
          rentFeeByToken,
          rentDuration
        )
    ).to.be.reverted;

    // * -----------------------------------------------------------------------
    // * Input wrong token contarct address with remainSignerArray[0].address.
    // * -----------------------------------------------------------------------
    await expect(
      rentMarketContract
        .connect(testNFTContractOwnerSigner)
        .changeNFT(
          remainSignerArray[0].address,
          startTokenId,
          rentFee,
          remainSignerArray[0].address,
          rentFeeByToken,
          rentDuration
        )
    ).to.be.reverted;
  });
});
