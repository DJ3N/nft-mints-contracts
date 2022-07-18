// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "./ERC721.sol";
import "./Ownable.sol";

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

    function makePool()
        external
        returns (address)
    {
        address nftCollection;

        bytes32 salt = keccak256(
            abi.encodePacked(
                collectionCount++
            )
        );

        bytes20 targetBytes = bytes20(
            nftBase
        );

        assembly {

            let clone := mload(0x40)

            mstore(
                clone,
                0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000
            )

            mstore(
                add(clone, 0x14),
                targetBytes
            )

            mstore(
                add(clone, 0x28),
                0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000
            )

            nftCollection := create2(
                0,
                clone,
                0x37,
                salt
            )
        }

        return nftCollection;
    }
}








