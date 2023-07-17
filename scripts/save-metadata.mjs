//* Save metadata script.
//* 1. Gather metadata from rent market contract.
//*   1-1. Get all register data from rent market contract.
//*   1-2. Get token URI from each nft contract.
//*   1-3. Get metadata from 1-2. token URI.
//* 2. Save metadata to database.
//*   2-1. Connect database.
//*   2-2. Make table as to metadata field.
//*   2-3. Save all metadata to database.
//* 3. Change table (or database) - optional
//*   - Maintain the legacy table while new table is being stored.
//*   - After new table is finished to be saved, change table.

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import rentMarketABI from "../artifacts/contracts/rentMarket.sol/rentMarket.json" assert { type: "json" };
dotenv.config();

async function getAllRegisterData({ provider, rentMarketContract }) {
  // console.log("call getAllRegisterData()");

  const allRegisterDataArray = await rentMarketContract.getAllRegisterData();
  // console.log("allRegisterDataArray: ", allRegisterDataArray);
  return allRegisterDataArray;
}

async function getAllCollection({ provider, rentMarketContract }) {
  // console.log("call getAllCollection()");

  const allCollectionArray = await rentMarketContract.getAllCollection();
  // console.log("allCollectionArray: ", allCollectionArray);
  return allCollectionArray;
}

async function addMetadata({
  provider,
  rentMarketContract,
  allRegisterDataArray,
  allCollectionArray,
}) {
  // * Set default tokenURI function ABI based on OpenZeppelin code.
  const tokenUriAbi = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const allRegisterDatayArrayWithMetadata = await Promise.all(
    allRegisterDataArray.map(async function (registerData) {
      const nftContract = new ethers.Contract(
        registerData.nftAddress,
        tokenUriAbi,
        provider
      );
      const tokenUri = await nftContract.tokenURI(registerData.tokenId);
      const response = await axios.get(tokenUri);
      const metadata = response.data;
      return {
        ...registerData,
        metadata,
      };
    })
  );
  // console.log(
  //   "allRegisterDatayArrayWithMetadata: ",
  //   allRegisterDatayArrayWithMetadata
  // );
  return allRegisterDatayArrayWithMetadata;
}

async function fetchMetadata() {
  //* TODO: Set blockchain network from argument. (default is maticmum)
  const provider = new ethers.providers.AlchemyProvider(
    process.env.NETWORK,
    process.env.ALCHEMY_KEY_MUMBAI
  );
  // console.log(
  //   "process.env.RENTMARKET_CONTRACT_ADDRESS: ",
  //   process.env.RENTMARKET_CONTRACT_ADDRESS
  // );
  const rentMarketContract = new ethers.Contract(
    process.env.RENTMARKET_CONTRACT_ADDRESS,
    rentMarketABI["abi"],
    provider
  );

  //* Get all register data array.
  let allRegisterDataArray = await getAllRegisterData({
    provider,
    rentMarketContract,
  });

  //* Get all collection array.
  let allCollectionArray = await getAllCollection({
    provider,
    rentMarketContract,
  });

  //* Filter all register data with collection address.
  //* It's because all register data may have unfiltered-by-collection data.
  allRegisterDataArray = allRegisterDataArray.filter(function (registerData) {
    return allCollectionArray.some(
      (collection) =>
        collection.collectionAddress.localeCompare(
          registerData.nftAddress,
          undefined,
          { sensitivity: "accent" }
        ) === 0
    );
  });

  //* Add token URI data to each register data.
  //* Add metadata to each register data.
  allRegisterDataArray = await addMetadata({
    provider,
    rentMarketContract,
    allRegisterDataArray,
    allCollectionArray,
  });

  return allRegisterDataArray;
}

async function saveMetadata({ metadataArray }) {
  const prisma = new PrismaClient();

  //* Delete all avatar data.
  const deleteAvatars = await prisma.avatar.deleteMany({});
  console.log("deleteAvatars: ", deleteAvatars);

  //* Make nftAddress to lowercase for unity.
  await Promise.all(
    metadataArray.map(async function (data) {
      // console.log("data: ", data);
      // console.log("data.metadata.attributes: ", data.metadata.attributes);

      //* Get each data.
      const nftAddress = data.nftAddress.toLowerCase();
      const tokenId = data.tokenId.toNumber();
      const name = data.metadata.name || "none";
      const symbol = data.metadata.symbol || "none";
      const description = data.metadata.description || "none";
      const imageUrl = data.metadata.image || "none";
      const gltUrl = data.metadata.realbits.glb_url || "none";
      const vrmUrl = data.metadata.realbits.vrm_url || "none";

      let hair,
        face,
        top,
        middle,
        side,
        bottom,
        body,
        body_top,
        body_bottom,
        background;

      data.metadata.attributes.map(function (attribute) {
        console.log("attribute: ", attribute);

        switch (attribute.trait_type) {
          case "Hair":
            hair = attribute.value || "none";
            break;
          case "Face":
            face = attribute.value || "none";
            break;
          case "Top":
            top = attribute.value || "none";
            break;
          case "Middle":
            middle = attribute.value || "none";
            break;
          case "Side":
            side = attribute.value || "none";
            break;
          case "Bottom":
            bottom = attribute.value || "none";
            break;
          case "Body":
            body = attribute.value || "none";
            break;
          case "Body_Top":
            body_top = attribute.value || "none";
            break;
          case "Body_Bottom":
            body_bottom = attribute.value || "none";
            break;
          case "Background":
            background = attribute.value || "none";
            break;
        }
      });
      const nftAddressWithTokenId = `${nftAddress}/${tokenId}`;

      //* Update or insert data.
      const createAvatar = await prisma.avatar.create({
        data: {
          nftAddressWithTokenId: nftAddressWithTokenId,
          nftAddress: nftAddress,
          tokenId: tokenId,
          name: data.metadata.name,
          symbol: data.metadata.symbol,
          description: data.metadata.description,
          imageUrl: data.metadata.image,
          gltUrl: data.metadata.realbits.glb_url,
          vrmUrl: data.metadata.realbits.vrm_url,
          hair: hair,
          face: face,
          top: top,
          middle: middle,
          side: side,
          bottom: bottom,
          body: body,
          body_top: body_top,
          body_bottom: body_bottom,
          background: background,
        },
      });
      console.log("createAvatar: ", createAvatar);
    })
  );

  console.log("Saving metadata is finished.");
}

async function main() {
  const metadataArray = await fetchMetadata();
  await saveMetadata({ metadataArray });
}

main();
