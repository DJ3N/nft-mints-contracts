const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Market", function () {
    let owner, bob, alice
    let FollowManager, FollowManagerDeployer



    beforeEach(async function () {
        [owner, bob, alice] = await ethers.getSigners();

        FollowManagerDeployer = await ethers.getContractFactory('FollowManager')

        FollowManager = await FollowManagerDeployer.deploy()

    })

    it('Basic signing', async function () {

        let packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", bob.address, owner.address ]
        );

        let hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        let sig = await bob.signMessage(ethers.utils.arrayify(hashed))

        let splitSig = ethers.utils.splitSignature(sig)

        let result = await FollowManager.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("true")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf and more stuff", bob.address, owner.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await bob.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await FollowManager.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", bob.address, owner.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await alice.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await FollowManager.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", alice.address, owner.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await alice.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await FollowManager.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", bob.address, alice.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await alice.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await FollowManager.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")
    })

});
