const { expect } = require("chai");
const {
  initializeBeforeEach,
  rentNFTName,
  rentNFTSymbol,
} = require("./utility-function");

describe("test rentNFT true case.", function () {
  // * -------------------------------------------------------------------------
  // * Define variables.
  // * -------------------------------------------------------------------------
  let // * Signer values.
    rentNFTContractOwnerSigner,
    userSigner,
    remainSignerArray,
    // * Contract values.
    rentNFTContract;

  beforeEach(async function () {
    // * -----------------------------------------------------------------------
    // * Initialize contract and data.
    // * - Deploy smart contract with fixture and mint NFT.
    // * -----------------------------------------------------------------------
    const response = await initializeBeforeEach();

    // * -----------------------------------------------------------------------
    // * Set each returned value.
    // * -----------------------------------------------------------------------
    ({
      // * Signer values.
      rentNFTContractOwnerSigner,
      userSigner,
      remainSignerArray,
      // * Contract values.
      rentNFTContract,
    } = response);
  });

  it("test NFT deploy and check name and symbol.", async function () {
    // * -----------------------------------------------------------------------
    // * Define variables.
    // * -----------------------------------------------------------------------
    const name = await rentNFTContract.connect(userSigner).name();
    const symbol = await rentNFTContract.connect(userSigner).symbol();

    expect(name).to.equal(rentNFTName);
    expect(symbol).to.equal(rentNFTSymbol);
  });

  it("test to mint NFT and check token URI.", async function () {
    // * -----------------------------------------------------------------------
    // * Define variables.
    // * -----------------------------------------------------------------------
    const startTokenId = 1;
    const endTokenId = 5;
    const BASE_TOKEN_URI =
      "https://dulls-nft.s3.ap-northeast-2.amazonaws.com/json/";

    // * -----------------------------------------------------------------------
    // * Mint 5 NFTs.
    // * -----------------------------------------------------------------------
    let originalTokenURIArray = [];
    let txArray = [];
    for (let i = startTokenId; i <= endTokenId; i++) {
      const toAddress = rentNFTContractOwnerSigner.address;
      const tokenURI = `${BASE_TOKEN_URI}${i}`;
      const tx = await rentNFTContract
        .connect(rentNFTContractOwnerSigner)
        .safeMint(toAddress);
      txArray.push(tx.wait());
      originalTokenURIArray.push(tokenURI);
    }
    await Promise.all(txArray);
    // console.log("originalTokenURIArray: ", originalTokenURIArray);

    // * -----------------------------------------------------------------------
    // * Get all minted NFT data.
    // * -----------------------------------------------------------------------
    const totalSupply = await rentNFTContract.connect(userSigner).totalSupply();
    let tokenURIArray = [];
    for (let i = 0; i < totalSupply; i++) {
      const tokenId = await rentNFTContract.connect(userSigner).tokenByIndex(i);
      const tokenURI = await rentNFTContract
        .connect(userSigner)
        .tokenURI(tokenId);
      tokenURIArray.push(tokenURI);
    }
    // console.log("tokenURIArray: ", tokenURIArray);

    // * -----------------------------------------------------------------------
    // * Compare the output data with input data.
    // * -----------------------------------------------------------------------
    expect(tokenURIArray).to.deep.equal(originalTokenURIArray);
  });
});
