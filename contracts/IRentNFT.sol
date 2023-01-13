// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @dev Required interface of an rentNFT compliant contract.
 */
interface IRentNFT is IERC165 {
    /**
     * @dev Returns the register's account address.
     */
    function checkRegisterRole(address registerAddress)
        external
        view
        returns (bool result);
}
