// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "./rentNFT.sol";

/// @title A paymentNFT contract.
/// @author A realbits software development team.
/// @notice You can use this contract for pay for service.
/// @dev All function calls are currently being tested.
contract paymentNFT is rentNFT {
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_
    ) rentNFT(name_, symbol_, baseTokenURI_) {}
}
