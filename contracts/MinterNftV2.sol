// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "./ERC721Enumerable.sol";

contract MinterNftV2 is ERC721Enumerable, Ownable{

    mapping(uint256 => string) public tokenURIs;

    uint256 public nextId;

    uint256 public maxSupply;

    //Scaled E18
    uint256 public royaltyPercentage;

    uint256 constant PRECISION = 1e18;

    bool initialized;

    event Mint(address indexed minter, uint256 tokenID);
    event CallbackMint(uint256 indexed mintID, uint256 indexed tokenID);

    modifier checkMaxSupply() {
        require(
            nextId <= maxSupply,
            "MAX SUPPlY REACHED"
        );
        _;
    }

    constructor()
        ERC721("NFT BASE", "NFTB")
    {
        //Because initialized is not constant or immutable, its value will not be transfered when cloning
        //Lock down the base contract on deployment just so nobody can highjack it to mint their own things (Even though it wouldnt technically matter)
        initialized = true;
    }

    function initialize(
        string memory _initializedName,
        string memory _initializedSymbol,
        address _owner,
        uint256 _maxSupply
    )
        external
    {
        //Only allow initializing once rather than specifically permissioning the factory
        //Factory creates then calls initialize in the same transaction with no other calls, so nothing can get in before this on a contract
        //cloned from factory
        require(!initialized, "ALREADY INITIALIZED");
        initialized = true;
        _name = _initializedName;
        _symbol = _initializedSymbol;
        _transferOwnership(_owner);
        maxSupply = _maxSupply;
        nextId = 1;
    }

    function mintURI(address _to, string calldata _uri)
        public
        onlyOwner
        checkMaxSupply
    {
        tokenURIs[nextId] = _uri;
        _safeMint(_to, nextId);
        emit Mint(msg.sender, nextId);
        nextId++;
    }

    function mintCallbackURI(address _to, uint256 _mintId, string calldata _uri)
        external
        onlyOwner
        checkMaxSupply
    {
        tokenURIs[nextId] = _uri;
        _safeMint(_to, nextId);
        emit CallbackMint(_mintId, nextId);
        nextId++;
    }

    function bulkMintURI(
        address[] calldata _to,
        string[] calldata _uris
    )
        external
    {
        for (uint256 i = 0; i < _to.length; i++){
            mintURI(_to[i], _uris[i]);
        }
    }

    function tokenURI(uint256 _tokenId)
        public
        override
        view
        returns (string memory)
    {
        return tokenURIs[_tokenId];
    }

    function setRoyaltyPercentage(
        uint256 _newPercentage
    )
        external
        onlyOwner
    {
        require(
            _newPercentage < PRECISION,
            "ROYALTY CANNOT EXCEED 100%"
        );
        royaltyPercentage = _newPercentage;
    }

    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view returns (
        address receiver,
        uint256 royaltyAmount
    )
    {
        return (owner(), _salePrice * royaltyPercentage / PRECISION);
    }
}

