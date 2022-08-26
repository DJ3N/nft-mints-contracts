// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "./ERC721.sol";
import "./interfaces/IInitializable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract NftFactory is Ownable{

    address public nftBase;

    uint256 public collectionCount;

    event CollectionCreated(address indexed deployer, address collection);

    function updateBase(
        address _newBase
    )
        external
        onlyOwner
    {
        nftBase = _newBase;
    }

    function deployCollection(
        string memory _name,
        string memory _symbol,
        address _createFor,
        uint256 _maxSupply
    )
        external
        returns (address)
    {
        address collection = Clones.cloneDeterministic(
            nftBase,
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    collectionCount++
                )
            )
        );
        IInitializable(collection).initialize(
            _name,
            _symbol,
            _createFor,
            _maxSupply
        );

        emit CollectionCreated(msg.sender, collection);

        return collection;
    }

    function predictAddress(
        uint256 _collectionCount
    )
        external
        view
        returns (address)
    {
        return Clones.predictDeterministicAddress(
            nftBase,
            keccak256(
                abi.encodePacked(
                    msg.sender,
                    _collectionCount
                )
            )
        );
    }
}
