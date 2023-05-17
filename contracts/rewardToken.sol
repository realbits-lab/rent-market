// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title A reward token class.
/// @author A realbits dev team.
/// @dev A reward token is used to reward to project contributors.
contract rewardToken is ERC20 {
    /// @dev Mint 1 billion tokens to vesting wallet.
    constructor(
        string memory rewardTokenName_,
        string memory rewardTokenSymbol_,
        address rewardTokenVestingWalletContractAddress_
    ) ERC20(rewardTokenName_, rewardTokenSymbol_) {
        require(
            rewardTokenVestingWalletContractAddress_ != address(0),
            "rewardToken: rewardTokenVestingWalletContractAddress is zero address"
        );

        _mint(
            rewardTokenVestingWalletContractAddress_,
            1_000_000_000 * (10 ** 18)
        );
    }
}
