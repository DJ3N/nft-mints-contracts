// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "./ERC721Enumerable.sol";

contract MinterNftV2 is ERC721Enumerable, Ownable{

    mapping(uint256 => string) public tokenURIs;

    mapping(uint256 => uint256) public mintIdToTokenId;

    uint256 public nextId;

    uint256 public maxSupply;

    bool initialized;

    event Mint(address indexed minter, address collection);

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
        owner = _owner;
        maxSupply = _maxSupply;
        nextId = 1;
    }

    function setOwner(address _newOwner)
        external
        onlyOwner
    {
        owner = _newOwner;
    }

    function mintURI(address _to, string memory _uri)
        external
        onlyOwner
    {
        require(
            nextId <= maxSupply,
            "MAX SUPPlY REACHED"
        );
        tokenURIs[nextId] = _uri;
        _safeMint(_to, nextId);
        nextId++;
    }

    function mintCallbackURI(address _to, uint256 _mintId, string memory _uri)
        external
        onlyOwner
    {
        require(
            nextId <= maxSupply,
            "MAX SUPPlY REACHED"
        );
        tokenURIs[nextId] = _uri;
        _safeMint(_to, nextId);
        mintIdToTokenId[_mintId] = nextId;
        nextId++;
    }

    function tokenURI(uint256 _tokenId)
        public
        override
        view
        returns (string memory)
    {
        return tokenURIs[_tokenId];
    }
}

