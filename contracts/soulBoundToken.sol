// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title A soul bound token contract.
contract SoulBoundToken is ERC721, Ownable {
    using Counters for Counters.Counter;

    /// @notice Token ID counter
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("SoulBoundToken", "SBT") {}

    /// @notice Constructor function
    /// @param to Address to receive the minted token
    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    /// @notice Constructor function
    /// @param tokenId Token ID which will be burned
    function burn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner of the token can burn it."
        );
        _burn(tokenId);
    }

    /// @notice Hook override _beforeTokenTransfer function before transfer call
    /// @param from Sender address
    /// @param to Receiver address
    /// @param tokenId Token ID
    /// @param batchSize Batch size
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal pure override(ERC721) {
        require(
            from == address(0) || to == address(0),
            "This a Soulbound token. It cannot be transferred."
        );
    }

    /// @notice Hook override _burn function before transfer call
    /// @param tokenId Token ID
    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }
}
