// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "./ERC721.sol";
import "./Ownable.sol";
import "hardhat/console.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract NftFactory is Ownable{

    address nftBase;

    uint256 collectionCount;

    function updateBase(
        address _newBase
    )
        external
        onlyOwner
    {
        nftBase = _newBase;
    }

    function deployCollection()
        external
    {
        Clones.cloneDeterministic(
            nftBase,
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    collectionCount++
                )
            )
        );
    }

    function predictAddress()
        external
        view
        returns (address)
    {
        return Clones.predictDeterministicAddress(
            nftBase,
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    collectionCount
                )
            )
        );
    }
}
