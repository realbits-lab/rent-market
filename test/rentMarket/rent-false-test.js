const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { initializeBeforeEach, registerNFT } = require("./utility-function");

describe("test rentNFT false case.", function () {
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

  it("test rentNFT with wrong token id.", async function () {
    const errorMessage = "RM7";
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

    // 2. Check error with wrong token ID.
    const response = await rentMarketContract
      .connect(userSigner)
      .getRegisterData(testNFTContract.address, startTokenId);
    const options = {
      value: response["rentFee"],
    };
    await expect(
      rentMarketContract
        .connect(userSigner)
        .rentNFT(
          testNFTContract.address,
          BigNumber.from(startTokenId).add(1),
          serviceContractOwnerSigner.address,
          options
        )
    ).to.be.revertedWith(errorMessage);
  });

  it("test rentNFT with wrong rent fee.", async function () {
    let tx;
    const errorMessage = "RM8";
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

    // 3. Check error with wrong rent fee.
    let options = {
      value: ethers.utils.parseUnits("2", "wei"),
    };
    await expect(
      rentMarketContract
        .connect(userSigner)
        .rentNFT(
          testNFTContract.address,
          startTokenId,
          serviceContractOwnerSigner.address,
          options
        )
    ).to.be.revertedWith(errorMessage);

    // 4. Rent NFT with over rent fee.
    options = {
      value: ethers.utils.parseEther("3000000", "gwei"),
    };
    await expect(
      rentMarketContract
        .connect(userSigner)
        .rentNFT(
          testNFTContract.address,
          startTokenId,
          serviceContractOwnerSigner.address,
          options
        )
    ).to.be.revertedWith(errorMessage);
  });
});
