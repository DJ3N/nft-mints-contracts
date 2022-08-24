// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleMarketPlace is ReentrancyGuard, Ownable{

    struct Listing {
        address payable tokenOwner;
        uint256 buyoutPrice;
    }

    mapping(bytes32 => Listing) public Listings;

    uint256 public fee;

    uint256 constant PRECISION = 1e18;
    uint256 constant MAXFEE = 15e17;

    modifier onlyListingOwner(
        address _collection,
        uint256 _id
    )
    {
        require(
            msg.sender == Listings[generateListingID(_collection, _id)].tokenOwner,
            "NOT LISTING OWNER"
        );
        _;
    }

    constructor(uint256 _fee)
    {
        setFee(_fee);
    }

    function generateListingID(
        address _collection,
        uint256 _id
    )
        public
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(_collection, _id)
        );
    }

    function listNFT(
        address _collection,
        uint256 _id,
        uint256 _onePrice,
        address payable _listFor
    )
        external
        nonReentrant
    {
        //We use transferFrom here instead of safetransferFrom because we do not want this contract to accept nft transfers outside this function.
        //Therefore, we should use transferFrom here, so that any safeTransferFroms to this contract revert properly because we do not implement onERC721Received
        IERC721(_collection).transferFrom(
            msg.sender,
            address(this),
            _id
        );
        bytes32 listingID = generateListingID(_collection, _id);
        Listings[listingID] = Listing({
            tokenOwner : _listFor,
            buyoutPrice : _onePrice
        });
    }

    function delistNFT(
        address _collection,
        uint256 _id
    )
        external
        nonReentrant
        onlyListingOwner(_collection, _id)
    {
        delete Listings[generateListingID(_collection, _id)];
        //Use safeTransferFrom here to make sure that receiving contract expects erc721 transfers
        IERC721(_collection).safeTransferFrom(
            msg.sender,
            address(this),
            _id
        );
    }

    function changePrice(
        address _collection,
        uint256 _id,
        uint256 _newPrice
    )
        external
        onlyListingOwner(_collection, _id)
    {
        Listings[generateListingID(_collection, _id)].buyoutPrice = _newPrice;
    }

    function buyNFT(
        address _collection,
        uint256 _id
    )
        external
        payable
        nonReentrant
    {
        require(
            msg.value == Listings[generateListingID(_collection, _id)].buyoutPrice * fee / PRECISION,
            "WRONG BUYOUT AMOUNT"
        );

        IERC721(_collection).transferFrom(
            address(this),
            msg.sender,
            _id
        );

        Listings[generateListingID(_collection, _id)].tokenOwner.transfer(Listings[generateListingID(_collection, _id)].buyoutPrice);

        delete Listings[generateListingID(_collection, _id)];

    }

    function setFee(
        uint256 _newFee
    )
        public
        onlyOwner
    {
        require(
            _newFee >= PRECISION,
            "NO NEGATIVE FEE"
        );
        require(
            _newFee <= MAXFEE,
            "MAX FEE 50%"
        );

        fee = _newFee;
    }

}