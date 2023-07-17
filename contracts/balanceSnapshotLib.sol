// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

library balanceSnapshotLib {
    using Arrays for uint256[];
    using Counters for Counters.Counter;

    //* ids: snapshot id which is recorded as block number.
    //* balance: current balance value.
    //* balanceByToken: current balance by token value.
    struct snapshotsData {
        uint256[] ids;
        uint256[] balance;
        uint256[] balanceByToken;
    }

    struct balanceSnapshotData {
        //* Account can be one of these.
        //* - renter: NFT owner account address and balance
        //* - service: Service operator account address and balance
        //* - market: Market contract owner account address and balance
        mapping(address => snapshotsData) accountBalanceSnapshots;
        //* Snapshot ids increase monotonically, with the first value being 1.
        //* An id of 0 is invalid.
        Counters.Counter currentSnapshotId;
    }

    /// @dev Creates a new snapshot and returns its snapshot id. Emits a Snapshot event that contains the same id.
    function makeSnapshot(
        balanceSnapshotData storage self
    ) public returns (uint256) {
        self.currentSnapshotId.increment();
        uint256 currentId = self.currentSnapshotId.current();
        return currentId;
    }

    /// @dev Get the current snapshotId.
    function getCurrentSnapshotId(
        balanceSnapshotData storage self
    ) public view returns (uint256) {
        return self.currentSnapshotId.current();
    }

    /// @dev Retrieves the total fee of `account` at the time `snapshotId` was created.
    function balanceOfAt(
        balanceSnapshotData storage self,
        address account,
        uint256 snapshotId
    )
        public
        view
        returns (bool found, uint256 balance, uint256 balanceByToken)
    {
        require(snapshotId > 0, "balanceSnapshot: id is 0");
        require(
            snapshotId <= self.currentSnapshotId.current(),
            "balanceSnapshot: nonexistent id"
        );

        snapshotsData storage snapshots = self.accountBalanceSnapshots[account];
        uint256 index = snapshots.ids.findUpperBound(snapshotId);
        // console.log("snapshots.ids.length: ", snapshots.ids.length);
        // for (uint256 i = 0; i < snapshots.ids.length; i++) {
        //     console.log("id: ", snapshots.ids[i]);
        // }
        // console.log("account: ", account);
        // console.log("snapshotId: ", snapshotId);
        // console.log("index: ", index);

        if (index == snapshots.ids.length) {
            return (false, 0, 0);
        } else {
            return (
                true,
                snapshots.balance[index],
                snapshots.balanceByToken[index]
            );
        }
    }

    //* Update balance snapshots before the values are modified.
    //* This is called in settleRentData function of rentMarket contract.
    function updateAccountBalance(
        balanceSnapshotData storage self,
        address account,
        uint256 balance,
        uint256 balanceByToken
    ) public {
        // console.log("account: ", account);
        // console.log("balance: ", balance);
        // console.log("balanceByToken: ", balanceByToken);

        snapshotsData storage snapshots = self.accountBalanceSnapshots[account];
        uint256 currentId = self.currentSnapshotId.current();
        // console.log("currentId: ", currentId);
        // console.log(
        //     "_getLastArrayValue(snapshots.ids): ",
        //     _getLastArrayValue(snapshots.ids)
        // );

        if (_getLastArrayValue(snapshots.ids) < currentId) {
            //* Push snapshot id.
            snapshots.ids.push(currentId);

            //* Push the balance.
            snapshots.balance.push(balance);

            //* Push the balance by token.
            snapshots.balanceByToken.push(balanceByToken);
        }
    }

    function _getLastArrayValue(
        uint256[] storage array
    ) private view returns (uint256 lastArrayValue) {
        if (array.length == 0) {
            return 0;
        } else {
            return array[array.length - 1];
        }
    }
}
