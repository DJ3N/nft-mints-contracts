// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SimpleMarketPlace is ReentrancyGuard{

    struct Listing {
        address tokenOwner;
        uint256 buyoutPrice;
    }

    mapping(uint256 => Listing) public Listings;

    function listNFT(
        address _collection,
        uint256 _id,
        uint256 _onePrice,
        address _listFor
    )
        external
        nonReentrant
    {
        IERC721(_collection).transferFrom(
            msg.sender,
            address(this),
            _id
        );
        uint256 listingID = keccak256(_collection, _id);
        Listings[listingID] = Listing({
            tokenOwner : _listFor,
            butoutPrice : _onePrice
        });
    }

    function delistNFT(
        address _collection,
        uint256 _id
    )
        external
        nonReentrant
    {

    }

    function changePrice(
        address _collection,
        uint256 _id,
        uint256 _newPrice
    )
        external
        nonReentrant
    {

    }

    function buyNFT(
        address _collection,
        uint256 _id
    )
        external
        nonReentrant
    {

    }

}