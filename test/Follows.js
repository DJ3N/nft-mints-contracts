const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Market", function () {
    let owner, bob, alice
    let FollowManager, FollowManagerDeployer, D3jnExternalFollows, D3jnExternalFollowsDeployer



    beforeEach(async function () {
        [owner, bob, alice] = await ethers.getSigners();

        D3jnExternalFollowsDeployer = await ethers.getContractFactory('D3jnExternalFollows')

        D3jnExternalFollows = await D3jnExternalFollowsDeployer.deploy()

        FollowManagerDeployer = await ethers.getContractFactory('FollowManager')

        FollowManager = await FollowManagerDeployer.deploy()

    })

    it('Basic signing', async function () {

        let packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", owner.address, bob.address ]
        );

        let hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        let sig = await bob.signMessage(ethers.utils.arrayify(hashed))

        let splitSig = ethers.utils.splitSignature(sig)

        let result = await D3jnExternalFollows.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("true")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf and more stuff", bob.address, owner.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await bob.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await D3jnExternalFollows.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", owner.address, bob.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await alice.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await D3jnExternalFollows.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", owner.address, alice.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await alice.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await D3jnExternalFollows.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        packed = ethers.utils.solidityPack(
            [ "string", "address", "address" ],
            [ "User Approves party to follow and unfollow on their behalf", alice.address, bob.address ]
        );

        hashed = ethers.utils.solidityKeccak256(['bytes'],[packed])

        sig = await alice.signMessage(ethers.utils.arrayify(hashed))

        splitSig = ethers.utils.splitSignature(sig)

        result = await D3jnExternalFollows.VerifyFollowApproval(owner.address, bob.address, splitSig.v, splitSig.r, splitSig.s);

        expect(result.toString()).to.equal("false")

        addy = await D3jnExternalFollows.VerifyMessage(hashed, splitSig.v, splitSig.r, splitSig.s)

        expect(addy.toString()).to.not.equal(bob.address.toString())

    })

    it('Follow/Unfollow', async function () {

        await FollowManager.follow(bob.address);

        await FollowManager.unfollow(bob.address, 1);
    })

});
