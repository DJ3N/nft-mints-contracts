// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FollowManager is Ownable{

    //State

    struct Follower{
        address managerContract;
        uint256 followedAtTimestamp;
    }

    struct CreatorData{
        mapping (uint256 => Follower) followers;
        mapping (address => uint256) rankFollowers;
        uint256 lifetimeFollowers;
        uint256 currentFollowers;
    }

    struct FanData{
        mapping (uint256 => address) following;
        uint256 lifetimeTotalFollowed;
    }

    mapping (address => CreatorData) public Creators;
    mapping (address => FanData) public Fans;

    address d3jnExternalFollows;

    //View Functions

    function viewFollower(address _creator, uint256 index)
        external
        view
        returns(address, uint256)
    {
        return (Creators[_creator].followers[index].managerContract, Creators[_creator].followers[index].followedAtTimestamp);
    }

    function viewRankFollowers(address _creator, address _fan)
        external
        view
        returns(uint256)
    {
        return Creators[_creator].rankFollowers[_fan];
    }

    function viewFollowing(address _fan, uint256 _index)
        external
        view
        returns(address)
    {
        return Fans[_fan].following[_index];
    }

    //Mutative Functions

    function follow(address _creator)
        external
    {
        require(
            Creators[_creator].rankFollowers[msg.sender] == 0,
            "Already Following"
        );

        Fans[msg.sender].lifetimeTotalFollowed++;
        Fans[msg.sender].following[Fans[msg.sender].lifetimeTotalFollowed] = _creator;

        Creators[_creator].lifetimeFollowers++;
        Creators[_creator].currentFollowers++;
        Creators[_creator].followers[Creators[_creator].lifetimeFollowers] = Follower({
            managerContract: msg.sender,
            followedAtTimestamp: block.timestamp
        });
        Creators[_creator].rankFollowers[msg.sender] = Creators[_creator].lifetimeFollowers;

    }

    function unfollow(address _creator, uint256 _index)
        external
    {
        require(
            Fans[msg.sender].following[_index] == _creator,
            "Invalid Creator/Index pairing"
        );

        delete Fans[msg.sender].following[_index];
        Creators[_creator].currentFollowers--;
        uint256 fanIndex = Creators[_creator].rankFollowers[msg.sender];
        delete Creators[_creator].followers[fanIndex];
        delete Creators[_creator].rankFollowers[msg.sender];
    }

    function setDj3nExternalFollows(address _newD3jnExternal)
        external
        onlyOwner
    {
        require(
            d3jnExternalFollows == address(0x0),
            "Contract already set"
        );
        d3jnExternalFollows = _newD3jnExternal;
    }

}