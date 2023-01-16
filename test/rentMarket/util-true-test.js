const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test utility function true case.", function () {
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
    // - 1-3. Register service.
    // - 1-4. Register collection.
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

  it("test to check normal isOwnerOrRenter owner case.", async function () {
    const startTokenId = 1;
    const endTokenId = 1;

    // 1. Register NFT.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 2. Call isOwnerOrRenter and get result.
    const response = await rentMarketContract
      .connect(userSigner)
      .isOwnerOrRenter(testNFTContractOwnerSigner.address);
    // console.log("response: ", response);

    // 3. Check the result.
    expect(response).to.be.equal(true);
  });

  it("test to check normal isOwnerOrRenter renter case.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;

    // 1. Register NFT.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 2. Get rentFee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const options = {
      value: response["rentFee"],
    };
    // console.log("responseRentFee: ", responseRentFee / Math.pow(10, 18));

    // 3. Rent NFT.
    tx = await rentMarketContract
      .connect(userSigner)
      .rentNFT(
        testNFTContract.address,
        startTokenId,
        serviceContractOwnerSigner.address,
        options
      );
    await tx.wait();

    // 4. Call isOwnerOrRenter and get result.
    response = await rentMarketContract
      .connect(userSigner)
      .isOwnerOrRenter(userSigner.address);
    // console.log("response: ", response);

    // 5. Check the result.
    expect(response).to.be.equal(true);
  });
});
