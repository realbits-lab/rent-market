// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IRentMarket {
    function getTotalAccountBalance(
        address tokenAddress_
    ) external view returns (uint256 totalAccountBalance_);
}

// import "hardhat/console.sol";

/// @title A reward token wallet class.
/// @author A realbits dev team.
/// @dev Receive vesting token from rewardToken contract and distribute to project contributors.
///
/// Receive token vesting from rewardToken contract by release function.
/// Send 40% of the vesting token to project team wallet.
/// Send 15% of the vesting token to token swap pool (ex: uniswap incentives).
/// Send 45% of the vesting token to rentMarket contracts as to their total balance.
/// each rentMarket contract distribute the receive vesting token to each balance account.
contract rewardTokenShare is Ownable {
    /// @dev rewardToken contract address.
    address private _rewardTokenContractAddress;

    /// @dev Project team account address which is used for sending the vesting token.
    address private immutable _projectTeamAccountAddress;

    /// @dev Token pool contract address.
    address private immutable _tokenPoolContractAddress;

    /// @dev rentMarket contract address array.
    address[] private _rentMarketContractAddressArray;

    /// @dev Project team account share.
    uint256 private immutable PROJECT_TEAM_ACCOUNT_SHARE = 40;

    /// @dev Token pool contract share.
    uint256 private immutable TOKEN_POOL_CONTRACT_SHARE = 15;

    /// @dev Rent market contract share.
    uint256 private immutable RENT_MARKET_CONTRACT_SHARE = 45;

    /// @dev Set the initial values.
    /// @param projectTeamAccountAddress_ Address for project team account.
    /// @param tokenPoolContractAddress_ Address for token pool contract.
    constructor(
        address projectTeamAccountAddress_,
        address tokenPoolContractAddress_
    ) {
        _projectTeamAccountAddress = projectTeamAccountAddress_;
        _tokenPoolContractAddress = tokenPoolContractAddress_;
    }

    function getRewardTokenBalance()
        public
        view
        returns (uint256 rewardTokenBalance_)
    {
        return IERC20(_rewardTokenContractAddress).balanceOf(address(this));
    }

    function setRewardTokenContractAddress(
        address rewardTokenContractAddress_
    ) public onlyOwner {
        _rewardTokenContractAddress = rewardTokenContractAddress_;
    }

    function getRewardTokenContractAddress()
        public
        view
        returns (address rewardTokenContractAddress_)
    {
        return _rewardTokenContractAddress;
    }

    function getProjectTeamAccountAddress()
        public
        view
        returns (address projectTeamAccountAddress_)
    {
        return _projectTeamAccountAddress;
    }

    function getTokenPoolContractAddress()
        public
        view
        returns (address tokenPoolContractAddress_)
    {
        return _tokenPoolContractAddress;
    }

    function getRentMarketContractAddressArray()
        public
        view
        returns (address[] memory rentMarketContractAddressArray_)
    {
        return _rentMarketContractAddressArray;
    }

    /// @dev Add rentMarket contract address.
    /// @param rentMarketContractAddress_ Address for rentMarket contract.
    function addRentMarketContractAddress(
        address rentMarketContractAddress_
    ) public onlyOwner {
        bool found;
        uint index;
        (found, index) = _findRentMarketContractAddress(
            rentMarketContractAddress_
        );

        if (found == false) {
            _rentMarketContractAddressArray.push(rentMarketContractAddress_);
        }
    }

    /// @dev Remove rentMarket contract address.
    /// @param rentMarketContractAddress_ Address for rentMarket contract.
    function removeRentMarketContractAddress(
        address rentMarketContractAddress_
    ) public onlyOwner {
        bool found;
        uint index;
        (found, index) = _findRentMarketContractAddress(
            rentMarketContractAddress_
        );

        //* Swap the last item and found item, and pop the last.
        if (found == true) {
            _rentMarketContractAddressArray[
                index
            ] = _rentMarketContractAddressArray[
                _rentMarketContractAddressArray.length - 1
            ];
            _rentMarketContractAddressArray.pop();
        }
    }

    /// @dev Find the same rentMarket contract address as the input and return it. If not, return zero address.
    function _findRentMarketContractAddress(
        address inputRentMarketContractAddress_
    )
        internal
        view
        returns (bool found_, uint foundRentMarketContractAddressArrayIndex_)
    {
        for (uint i = 0; i < _rentMarketContractAddressArray.length; i++) {
            if (
                _rentMarketContractAddressArray[i] ==
                inputRentMarketContractAddress_
            ) {
                return (true, i);
            }
        }

        return (false, 0);
    }

    /// @dev Check the rewardToken balance and if any, transfer.
    function release() public {
        //* Check the reward token balance of this contract.
        uint256 vestingTokenAmount = IERC20(_rewardTokenContractAddress)
            .balanceOf(address(this));

        if (vestingTokenAmount == 0) {
            return;
        }

        //* Send 40% of reward token balance to the project team wallet account address.
        uint256 projectTeamAccountAmount = SafeMath.div(
            vestingTokenAmount * PROJECT_TEAM_ACCOUNT_SHARE,
            100
        );
        IERC20(_rewardTokenContractAddress).transfer(
            _projectTeamAccountAddress,
            projectTeamAccountAmount
        );

        //* Send 15% of reward token balance to the token swap pool.
        uint256 tokenPoolContractAmount = SafeMath.div(
            vestingTokenAmount * TOKEN_POOL_CONTRACT_SHARE,
            100
        );
        IERC20(_rewardTokenContractAddress).transfer(
            _tokenPoolContractAddress,
            tokenPoolContractAmount
        );

        //* Send 45% of reward token balance to rentMarket contracts as to their total balance rate.
        uint256 rentMarketContractShare = vestingTokenAmount -
            projectTeamAccountAmount -
            tokenPoolContractAmount;
        uint256[] memory rentMarketTotalBalanceArray = new uint256[](
            _rentMarketContractAddressArray.length
        );

        uint256 totalRentMarketBalance = 0;
        for (uint256 i = 0; i < _rentMarketContractAddressArray.length; i++) {
            uint256 totalAccountBalance = IRentMarket(
                _rentMarketContractAddressArray[i]
            ).getTotalAccountBalance(_rewardTokenContractAddress);
            rentMarketTotalBalanceArray[i] = totalAccountBalance;
            totalRentMarketBalance += totalAccountBalance;
        }

        for (uint256 i = 0; i < _rentMarketContractAddressArray.length; i++) {
            uint256 share = 0;
            uint256 totalSentAmount = 0;

            if (i == _rentMarketContractAddressArray.length - 1) {
                share = rentMarketContractShare - totalSentAmount;
            } else {
                share = SafeMath.div(
                    rentMarketContractShare * rentMarketTotalBalanceArray[i],
                    totalRentMarketBalance
                );
                totalSentAmount += share;
            }

            IERC20(_rewardTokenContractAddress).approve(
                _rentMarketContractAddressArray[i],
                share
            );
        }
    }
}
