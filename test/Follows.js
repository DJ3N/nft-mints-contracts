const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


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

        //Actions

        await FollowManager.follow(bob.address);

        await expect(
            FollowManager.follow(bob.address)
        ).to.be.revertedWith("Already Following")

        //Data Calls

        let creatorData = await FollowManager.Creators(bob.address);

        let rank = await FollowManager.viewRankFollowers(bob.address, owner.address);

        let viewFollower = await FollowManager.viewFollower(bob.address, 1);

        let viewFollowing = await FollowManager.viewFollowing(owner.address, "1");

        //Data Checks

        expect(creatorData.lifetimeFollowers).to.be.equal("1")

        expect(creatorData.currentFollowers).to.be.equal("1")

        expect(viewFollower[0]).to.be.equal(owner.address) //Follower

        expect(viewFollower[1].toNumber()).to.be.greaterThan(1661566531)//timestamp of follow

        expect(rank.toString()).to.be.equal("1")

        expect(viewFollowing).to.be.equal(bob.address)

        //Actions

        await FollowManager.unfollow(bob.address, 1);

        await expect(
            FollowManager.unfollow(bob.address, 1)
        ).to.be.revertedWith("Invalid Creator/Index pairing")

        //Data Calls

        creatorData = await FollowManager.Creators(bob.address);

        rank = await FollowManager.viewRankFollowers(bob.address, owner.address);

        viewFollower = await FollowManager.viewFollower(bob.address, 1);

        viewFollowing = await FollowManager.viewFollowing(owner.address, "1");

        //Data Checks

        expect(creatorData.lifetimeFollowers).to.be.equal("1")

        expect(creatorData.currentFollowers).to.be.equal("0")

        expect(viewFollower[0]).to.be.equal(ZERO_ADDRESS) //Follower

        expect(viewFollower[1].toNumber()).to.be.lessThan(1)//timestamp of follow

        expect(rank.toString()).to.be.equal("0")

        expect(viewFollowing).to.be.equal(ZERO_ADDRESS)
    })

    it('Multi Party Follows', async function () {
        //Actions

        await FollowManager.follow(bob.address);

        await FollowManager.connect(alice).follow(bob.address);

        await expect(
            FollowManager.connect(alice).follow(bob.address)
        ).to.be.revertedWith("Already Following")

        //Data Calls

        let creatorData = await FollowManager.Creators(bob.address);

        let rank = await FollowManager.viewRankFollowers(bob.address, owner.address);

        let viewFollower = await FollowManager.viewFollower(bob.address, "2");

        let viewFollowing = await FollowManager.viewFollowing(alice.address, "1");

        //Data Checks

        expect(creatorData.lifetimeFollowers).to.be.equal("2")

        expect(creatorData.currentFollowers).to.be.equal("2")

        expect(viewFollower[0]).to.be.equal(alice.address) //Follower

        expect(viewFollower[1].toNumber()).to.be.greaterThan(1661566531)//timestamp of follow

        expect(rank.toString()).to.be.equal("1")

        expect(viewFollowing).to.be.equal(bob.address)

        //Actions

        await expect(
            FollowManager.connect(alice).unfollow(owner.address, 1)
        ).to.be.revertedWith("Invalid Creator/Index pairing")

        await expect(
            FollowManager.connect(alice).unfollow(bob.address, 2)
        ).to.be.revertedWith("Invalid Creator/Index pairing")

        await FollowManager.connect(alice).unfollow(bob.address, 1);

        await expect(
            FollowManager.connect(alice).unfollow(bob.address, 1)
        ).to.be.revertedWith("Invalid Creator/Index pairing")

        //Data Calls

        creatorData = await FollowManager.Creators(bob.address);

        rank = await FollowManager.viewRankFollowers(bob.address, alice.address);

        viewFollower = await FollowManager.viewFollower(bob.address, 1);

        viewFollowing = await FollowManager.viewFollowing(alice.address, "1");

        //Data Checks

        expect(creatorData.lifetimeFollowers).to.be.equal("2")

        expect(creatorData.currentFollowers).to.be.equal("1")

        expect(viewFollower[0]).to.be.equal(owner.address) //Follower

        expect(viewFollower[1].toNumber()).to.be.greaterThan(1661566531)//timestamp of follow

        expect(rank.toString()).to.be.equal("0")

        expect(viewFollowing).to.be.equal(ZERO_ADDRESS)
    });



});