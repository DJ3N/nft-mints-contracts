// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FollowManager is Ownable{

    struct Follows{
        bytes32 root;
        uint256 timestamp;
    }

    struct Follower{
        address managerContract;
        uint256 followedAtTimestamp;
    }

    struct CreatorData{
        mapping (uint256 => Follower) followers;
        uint256 lifetimeFollowers;
        uint256 currentFollowers;
    }

    uint256 uploadIndex = 0;
    mapping (uint256 => Follows) dj3nFollows;

    function addFollowers(bytes32 _root)
        external
        onlyOwner
    {
        dj3nFollows[uploadIndex] = Follows({
            root: _root,
            timestamp: block.timestamp
        });
        uploadIndex++;
    }

    function claimFollow(
        address _user,
        address _creator,
        uint8 _v,
        bytes32 _r,
        bytes32 _s,
        bytes32[] memory _proof,
        uint256 _rootIndex,
        uint256 _index
    )
        external
    {
        require(
            VerifyFollowApproval(address(this), _user, _v, _r, _s),
            "Dj3n is not approved to add followers for this user"
        );

        bytes32 leaf = keccak256(
            abi.encodePacked(
                _user,
                _creator
            )
        );

        require(
            VerifyMerkleTree(
                _proof,
                dj3nFollows[_rootIndex].root,
                leaf,
                _index
            ),
            "Invalid Proof"
        );
    }

    function VerifyMerkleTree(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf,
        uint index
    ) public pure returns (bool) {
        bytes32 hash = leaf;

        for (uint i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (index % 2 == 0) {
                hash = keccak256(abi.encodePacked(hash, proofElement));
            } else {
                hash = keccak256(abi.encodePacked(proofElement, hash));
            }

            index = index / 2;
        }

        return hash == root;
    }

    function VerifyFollowApproval(address _approved, address user, uint8 _v, bytes32 _r, bytes32 _s) public pure returns(bool){
        bytes32 payloadHash = keccak256(abi.encodePacked("User Approves party to follow and unfollow on their behalf", user, _approved));
        if(VerifyMessage(payloadHash, _v, _r, _s) == user) return true;
        return false;
    }

    function VerifyMessage(bytes32 _hashedMessage, uint8 _v, bytes32 _r, bytes32 _s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }

}