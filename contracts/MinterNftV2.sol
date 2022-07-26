// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "./ERC721Enumerable.sol";

contract MinterNftV2 is ERC721Enumerable, Ownable{

    mapping(uint256 => string) public tokenURIs;

    mapping(uint256 => uint256) public mintIdToTokenId;

    uint256 public nextId;

    bool initialized;

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
        address _owner
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
        nextId = 1;
    }

    function setOwner(address _newOwner)
        external
        onlyOwner
    {
        owner = _newOwner;
    }

    function mint(address _to)
        public
        onlyOwner
    {
        _safeMint(_to, nextId);
        nextId++;
    }

    function mintURI(address _to, string memory _uri)
        external
        onlyOwner
    {
        setTokenURI(nextId, _uri);
        mint(_to);
    }

    function mintCallback(address _to, uint256 _mintId)
        public
        onlyOwner
    {
        _safeMint(_to, nextId);
        mintIdToTokenId[_mintId] = nextId;
        nextId++;
    }

    function mintCallbackURI(address _to, uint256 _mintId, string memory _uri)
        external
        onlyOwner
    {
        setTokenURI(nextId, _uri);
        mintCallback(_to, _mintId);
    }

    function setTokenURI(uint256 _tokenId, string memory _uri)
        public
        onlyOwner
    {
        tokenURIs[_tokenId] = _uri;
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

