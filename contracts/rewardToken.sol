// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

// import "hardhat/console.sol";

/// @title A reward token wallet class.
/// @author A realbits dev team.
/// @dev A reward token wallet is used to send the vesting tokens to project contributors periodically.
///
/// The total 1 billion tokens are made when deployer calls constructor.
contract rewardToken is ERC20, ERC20Permit {
    /// @dev Reward token released event.
    event RewardTokenReleased(uint256 amount);

    /// @dev The total released amount of reward token.
    uint256 private _totalReleased;

    /// @dev Share contract to which vesting would be sent.
    address private immutable _rewardTokenShareContractAddress;

    /// @dev Vesting start timestamp.
    uint256 private immutable _start;

    /// @dev Vesting duration timestamp.
    uint256 private immutable _duration;

    /// @dev Vesting frequency.
    uint256 private immutable _frequency;

    /// @dev Set the vesting start time as now which is a block.timestamp.
    constructor(
        string memory rewardTokenName_,
        string memory rewardTokenSymbol_,
        address rewardTokenShareContractAddress_,
        address projectTeamAccountAddress_
    )
        ERC20(rewardTokenName_, rewardTokenSymbol_)
        ERC20Permit(rewardTokenName_)
    {
        require(
            rewardTokenShareContractAddress_ != address(0),
            "rewardToken: rewardTokenShareContractAddress is zero address"
        );

        _rewardTokenShareContractAddress = rewardTokenShareContractAddress_;

        //* Set the start time of vesting.
        _start = block.timestamp;

        //* Set the total duration of vesting.
        _duration = 250 weeks;

        //* Set total frequency of vesting.
        _frequency = 50;

        //* Mint the 20% of total supply to project team account.
        _mint(projectTeamAccountAddress_, 200_000_000 * (10 ** 18));

        //* Mint the 80% of total supply to vesting schedule.
        _mint(address(this), 800_000_000 * (10 ** 18));
    }

    /// @dev Getter for the share contract address.
    function rewardTokenShareContractAddress() public view returns (address) {
        return _rewardTokenShareContractAddress;
    }

    /// @dev Getter for the vesting start timestamp.
    function start() public view returns (uint256) {
        return _start;
    }

    /// @dev Getter for the vesting duration.
    function duration() public view returns (uint256) {
        return _duration;
    }

    /// @dev Getter for the vesting frequency.
    function frequency() public view returns (uint256) {
        return _frequency;
    }

    /// @dev Amount of already released vesting.
    function totalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    /// @dev Getter for the amount of releasable reward token vesting.
    function currentReleasable() public view returns (uint256) {
        return totalVestedAmount(uint256(block.timestamp)) - totalReleased();
    }

    /// @dev Getter for the total token allocation.
    function totalAllocation() public view returns (uint256) {
        return IERC20(address(this)).balanceOf(address(this)) + totalReleased();
    }

    /// @dev Getter for the amount of minimum releasable reward token vesting.
    function minimumReleasable() public view returns (uint256) {
        return totalAllocation() / frequency();
    }

    /// @dev Getter for the remaining time to the next vesting by seconds.
    function remainingTimestampToNextVesting() public view returns (uint256) {
        uint256 currentBlockTimestamp = block.timestamp;
        uint256 vestingUnitTimestamp = duration() / frequency();
        uint256 remainingTimestamp = 0;

        for (uint256 i = 0; i < frequency(); i++) {
            remainingTimestamp =
                currentBlockTimestamp -
                vestingUnitTimestamp *
                i;
            if (remainingTimestamp < vestingUnitTimestamp) {
                return remainingTimestamp;
            }
        }

        return vestingUnitTimestamp;
    }

    /// @dev Release the tokens that have already vested.
    function release() public {
        uint256 amount = currentReleasable();
        require(
            amount > minimumReleasable(),
            "rewardToken: Releasable amount is smaller than the minimumReleasable."
        );

        SafeERC20.safeTransfer(
            IERC20(address(this)),
            rewardTokenShareContractAddress(),
            amount
        );

        _totalReleased += amount;

        emit RewardTokenReleased(amount);
    }

    /// @dev Calculates the amount of ether that has already vested.
    /// Default implementation is a linear vesting curve.
    function totalVestedAmount(
        uint256 timestamp_
    ) public view returns (uint256) {
        return _vestingSchedule(totalAllocation(), timestamp_);
    }

    /// @dev Implementation of the vesting formula.
    /// This returns the amount vested, as a function of time,
    /// for an asset given its total historical allocation.
    function _vestingSchedule(
        uint256 totalAllocation_,
        uint256 timestamp_
    ) internal view returns (uint256) {
        if (timestamp_ < start()) {
            return 0;
        } else if (timestamp_ > start() + duration()) {
            return totalAllocation_;
        } else {
            uint256 vestingAmount = (totalAllocation_ *
                (timestamp_ - start())) / duration();
            return vestingAmount;
        }
    }
}
