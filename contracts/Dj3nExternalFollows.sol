// SPDX-License-Identifier: GPLv3
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract D3jnExternalFollows is Ownable{

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

    mapping (uint256 => Follows) dj3nFollows;

    uint256 uploadIndex = 0;
    address followManager;

    function setFollowManager(address _newFollowManager)
        external
        onlyOwner
    {
        require(
            followManager == address(0x0),
            "Contract already set"
        );
        followManager = _newFollowManager;
    }


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
        bytes32 signaturePayload = getPayloadHash(address(this), _user);

        require(
            VerifyMessage(signaturePayload, _v, _r, _s) == _user, //We save some computations if we do this directly instead of calling VerifyFollowApproval
            "Dj3n is not approved to add followers for this user"
        );

        bytes32 leaf = keccak256(
            abi.encodePacked(
                _user,
                _creator,
                signaturePayload,
                _v,
                _r,
                _s
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

        //@TODO Add user to following with starting timestamp equal to time root was uploaded
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

    function getPayloadHash(address _approved, address _user )
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked("User Approves party to follow and unfollow on their behalf", _user, _approved));
    }

    function VerifyFollowApproval(address _approved, address _user, uint8 _v, bytes32 _r, bytes32 _s) public pure returns(bool){
        bytes32 payloadHash = getPayloadHash(_user,_approved);
        return VerifyMessage(payloadHash, _v, _r, _s) == _user;
    }

    function VerifyMessage(bytes32 _hashedMessage, uint8 _v, bytes32 _r, bytes32 _s) public pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }

}