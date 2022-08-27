// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FollowManager is Ownable{

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

    mapping (address => CreatorData) Creators;
    mapping (address => FanData) Fans;


    function follow(address creator)
        external
    {
        require(
            Creators[creator].rankFollowers[msg.sender] == 0,
            "Already Following"
        );

        Fans[msg.sender].lifetimeTotalFollowed++;
        Fans[msg.sender].following[Fans[msg.sender].lifetimeTotalFollowed] = creator;

        Creators[creator].lifetimeFollowers++;
        Creators[creator].currentFollowers++;
        Creators[creator].followers[Creators[creator].lifetimeFollowers] = Follower({
            managerContract: msg.sender,
            followedAtTimestamp: block.timestamp
        });
        Creators[creator].rankFollowers[msg.sender] = Creators[creator].lifetimeFollowers;

    }

    function unfollow(address creator, uint256 index)
        external
    {
        require(
            Fans[msg.sender].following[index] == creator,
            "Invalid Creator/Index pairing"
        );

        delete Fans[msg.sender].following[index];
        Creators[creator].currentFollowers--;
        uint256 fanIndex = Creators[creator].rankFollowers[msg.sender];
        delete Creators[creator].followers[fanIndex];
        delete Creators[creator].rankFollowers[msg.sender];
    }

}