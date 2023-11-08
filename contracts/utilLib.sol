// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Strings.sol";

library utilLib {
    function getNFTOwner(
        address nftAddress,
        uint256 tokenId
    ) private returns (address) {
        bool response;
        bytes memory responseData;

        //* Get the owner address of NFT with token ID.
        (response, responseData) = nftAddress.call(
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
}
