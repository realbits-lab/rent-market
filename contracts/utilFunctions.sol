// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IRentNFT.sol";

library utilFunctions {
    using ERC165Checker for address;

    function getNFTOwner(
        address nftAddress,
        uint256 tokenId
    ) public view returns (address) {
        //* Check nftAddress_ has IRentNFT interface.
        bool supportInterfaceResult = nftAddress.supportsInterface(
            type(IERC721).interfaceId
        );

        //* Call checkRegisterRole function and return result.
        if (supportInterfaceResult == true) {
            //* Get the owner address of NFT with token ID.
            address ownerAddress = IERC721(nftAddress).ownerOf(tokenId);
            // console.log("ownerAddress: ", ownerAddress);
            return ownerAddress;
        } else {
            return address(0);
        }
    }

    function checkRegister(
        address nftAddress_,
        address sender_
    ) public view returns (bool result) {
        //* Check nftAddress_ has IRentNFT interface.
        bool supportInterfaceResult = nftAddress_.supportsInterface(
            type(IRentNFT).interfaceId
        );

        //* Call checkRegisterRole function and return result.
        if (supportInterfaceResult == true) {
            //* Get the owner address of NFT with token ID.
            bool response = IRentNFT(nftAddress_).checkRegisterRole(sender_);
            // console.log("response: ", response);
            return response;
        } else {
            return false;
        }
    }
}
