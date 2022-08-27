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
        mapping (address => uint256) rankFollowing;
        uint256 lifetimeTotalFollowed;
    }

    mapping (address => CreatorData) Creators;
    mapping (address => FanData) Fans;


    function follow(address creator)
        external
    {
        Fans[msg.sender].lifetimeTotalFollowed++;
        Fans[msg.sender].following[Fans[msg.sender].lifetimeTotalFollowed] = creator;
        Fans[msg.sender].rankFollowing[creator] = Fans[msg.sender].lifetimeTotalFollowed;

        Creators[creator].lifetimeFollowers++;
        Creators[creator].currentFollowers++;
        Creators[creator].followers[Creators[creator].lifetimeFollowers] = Follower({
            managerContract: msg.sender,
            followedAtTimestamp: block.timestamp
        });
        Creators[creator].rankFollowers[msg.sender] = Creators[creator].lifetimeFollowers;

    }

}