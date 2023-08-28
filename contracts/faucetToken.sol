// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "./rewardToken.sol";

/// @title A faucetToken contract.
/// @author A realbits software development team.
/// @notice You can use this contract for faucet token for testing.
/// @dev All function calls are currently being tested.
contract faucetToken is rewardToken {
    uint256 private immutable FAUCET_AMOUNT = 100 ether;

    event Faucet(uint256 amount);

    constructor(
        string memory rewardTokenName_,
        string memory rewardTokenSymbol_,
        address rewardTokenShareContractAddress_,
        address projectTeamAccountAddress_
    )
        rewardToken(
            rewardTokenName_,
            rewardTokenSymbol_,
            rewardTokenShareContractAddress_,
            projectTeamAccountAddress_
        )
    {}

    function faucet() public {
        emit Faucet(FAUCET_AMOUNT);
        SafeERC20.safeTransfer(
            IERC20(address(this)),
            msg.sender,
            FAUCET_AMOUNT
        );
    }
}
