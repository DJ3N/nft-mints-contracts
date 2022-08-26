// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract SimpleMarketPlace is ReentrancyGuard, Ownable{

    struct Listing {
        address payable tokenOwner;
        uint256 buyoutPrice;
        bool isUSD;
    }

    mapping(bytes32 => Listing) public Listings;

    uint256 public fee;

    uint256 constant PRECISION = 1e18;
    uint256 constant MAXFEE = 15e17;
    address constant ChainkLinkONEUSDHarmonyNetwork = 0xdCD81FbbD6c4572A69a534D8b8152c562dA8AbEF;
    AggregatorV3Interface immutable ONE_USD_PRICE_FEED;

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

    constructor(uint256 _fee, address _oracle)
    {
        setFee(_fee);
        /*  This control structure here allows us to use custom oracle in tests, but also not worry about
            inputing the exact oracle on real deployment. No gas consideration because only in constructor
        */
        ONE_USD_PRICE_FEED = _oracle == address(0x0)
            ? AggregatorV3Interface(ChainkLinkONEUSDHarmonyNetwork)
            : AggregatorV3Interface(_oracle);
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
        uint256 _price,
        address payable _listFor,
        bool _isUSD
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
            buyoutPrice : _price,
            isUSD : _isUSD
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

        (
            /*uint80 roundID*/,
            int oneUSDPrice,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = ONE_USD_PRICE_FEED.latestRoundData();

        uint256 decimals = ONE_USD_PRICE_FEED.decimals();

        uint256 listingWithFee = Listings[generateListingID(_collection, _id)].buyoutPrice * fee / PRECISION;

        uint256 oneBuyoutPrice = Listings[generateListingID(_collection, _id)].isUSD
            ? listingWithFee * decimals / uint256(oneUSDPrice)
            : listingWithFee;

        require(
            msg.value >= oneBuyoutPrice,
            "WRONG BUYOUT AMOUNT"
        );

        IERC721(_collection).transferFrom(
            address(this),
            msg.sender,
            _id
        );

        Listings[generateListingID(_collection, _id)].tokenOwner.transfer(Listings[generateListingID(_collection, _id)].buyoutPrice);

        if(msg.value > oneBuyoutPrice) payable(msg.sender).transfer(msg.value - oneBuyoutPrice);

        delete Listings[generateListingID(_collection, _id)];

    }

    function collectFees()
        external
        onlyOwner
    {
        payable(owner()).transfer(address(this).balance);
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