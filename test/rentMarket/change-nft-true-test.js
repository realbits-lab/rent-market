const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test changeNFT true case.", function () {
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

  it("test changeNFT with normal case.", async function () {
    let tx;
    const startTokenId = 1;
    const endTokenId = 1;
    const rentFee = BigNumber.from(2);
    const rentFeeByToken = BigNumber.from(5);
    const rentDuration = BigNumber.from(500);
    const serviceName = "testServiceName";

    // 1. Register NFT to rent market.
    await registerNFT({
      rentMarketContract,
      testNFTContract,
      testNFTContractOwnerSigner,
      startTokenId: startTokenId,
      endTokenId: endTokenId,
    });

    // 2. Register token to rent market.
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .registerToken(remainSignerArray[0].address, serviceName);
    await tx.wait();

    // 3. Change NFT.
    tx = await rentMarketContract
      .connect(testNFTContractOwnerSigner)
      .changeNFT(
        testNFTContract.address,
        startTokenId,
        rentFee,
        remainSignerArray[0].address,
        rentFeeByToken,
        rentDuration
      );
    await tx.wait();

    // 4. Get register data.
    const response = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .getRegisterData(testNFTContract.address, startTokenId);

    // 5. Compare the output data with input data.
    expect(response).to.deep.equal([
      testNFTContract.address,
      BigNumber.from(startTokenId),
      rentFee,
      remainSignerArray[0].address,
      rentFeeByToken,
      rentDuration,
    ]);
  });
});
