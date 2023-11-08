const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test unrentNFTData true case.", function () {
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

  it("test unrentNFT function with normal case.", async function () {
    let tx;
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

    // 2. Get rent fee.
    response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const options = {
      value: response["rentFee"],
    };

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

    // 4. Unrent NFT.
    tx = await rentMarketContract
      .connect(rentMarketContractOwnerSigner)
      .unrentNFT(testNFTContract.address, startTokenId, userSigner.address);
    await tx.wait();

    // 5. Get rented NFT data from renter address.
    response = await rentMarketContract
      .connect(userSigner)
      .getRentData(testNFTContract.address, startTokenId, userSigner.address);
    // console.log("response: ", response);

    // 6. Compare the output data with input data.
    expect(response).to.deep.equal([
      ethers.constants.AddressZero,
      BigNumber.from(0),
      BigNumber.from(0),
      ethers.constants.AddressZero,
      BigNumber.from(0),
      false,
      BigNumber.from(0),
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      ethers.constants.AddressZero,
      BigNumber.from(0),
    ]);
  });
});
