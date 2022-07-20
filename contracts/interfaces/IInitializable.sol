// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

interface IInitializable {

    function initialize(
        string memory _name,
        string memory _symbol,
        address _owner
    )
    external;
}