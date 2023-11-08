// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IRentNFT.sol";

library utilFunctions {
    using ERC165Checker for address;

    function getNFTOwner(
        address nftAddress,
        uint256 tokenId
    ) public returns (address) {
        bool response;
        bytes memory responseData;

        //* Get the owner address of NFT with token ID.
        (response, responseData) = nftAddress.delegatecall(
            abi.encodeWithSignature("ownerOf(uint256)", tokenId)
        );

        // console.log("response: ", response);
        //* Check sender address is same as owner address of NFT.
        if (response == true) {
            return abi.decode(responseData, (address));
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
