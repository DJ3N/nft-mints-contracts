const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Market", function () {
  let owner, bob, alice
  let Factory, FactoryDeployer, MarketPlaceDeployer, MarketPlace, CollectionNft, FakeChainLinkDeployer, FakeChainLink



  beforeEach(async function () {
    [owner, bob, alice] = await ethers.getSigners();

    FactoryDeployer = await ethers.getContractFactory('NftFactory')

    Factory = await FactoryDeployer.deploy()

    FakeChainLinkDeployer = await ethers.getContractFactory('FakeChainLinkAggregator')

    FakeChainLink = await FakeChainLinkDeployer.deploy()

    await FakeChainLink.deployed()

    MarketPlaceDeployer = await ethers.getContractFactory('SimpleMarketPlace')

    MarketPlace = await MarketPlaceDeployer.deploy(ethers.utils.parseEther("1"), FakeChainLink.address)

    await Factory.deployed()

    await MarketPlace.deployed()

    CollectionNft = await ethers.getContractFactory("MinterNftV2");

    const DefaultBase = await CollectionNft.deploy();

    await Factory.updateBase(DefaultBase.address);

  })

  it('Simple list and buy nft', async function () {

    let addr1 = await Factory.predictAddress(0);

    await Factory.deployCollection("Best NFTs", "BNFT", owner.address, 10);

    const justDeployed = await CollectionNft.attach(
        addr1
    );

    await justDeployed.bulkMintURI([owner.address, owner.address], ["We like beans", "beans are good"]);

    await justDeployed.setApprovalForAll(MarketPlace.address, true)

    await MarketPlace.listNFT(
      justDeployed.address,
      1,
      ethers.utils.parseEther("5"),
      owner.address,
      false
    );

    await expect(
        MarketPlace.connect(bob).buyNFT(
          justDeployed.address,
          1,
          { value: ethers.utils.parseEther("1") }
      )
    ).to.be.revertedWith("WRONG BUYOUT AMOUNT")

    await MarketPlace.connect(bob).buyNFT(
        justDeployed.address,
        1,
        { value: ethers.utils.parseEther("5") }
    )

    const ownerAfter = await justDeployed.ownerOf(1);

    expect(ownerAfter).to.equal(bob.address)

  })

  it('Change nft price, only by listing owner', async function () {

    let addr1 = await Factory.predictAddress(0);

    await Factory.deployCollection("Best NFTs", "BNFT", owner.address, 10);

    const justDeployed = await CollectionNft.attach(
        addr1
    );

    await justDeployed.bulkMintURI([owner.address, owner.address], ["We like beans", "beans are good"]);

    await justDeployed.setApprovalForAll(MarketPlace.address, true)

    await MarketPlace.listNFT(
        justDeployed.address,
        1,
        ethers.utils.parseEther("5"),
        owner.address,
        false
    );

    await expect(
        MarketPlace.connect(bob).buyNFT(
            justDeployed.address,
            1,
            {value: ethers.utils.parseEther("1")}
        )
    ).to.be.revertedWith("WRONG BUYOUT AMOUNT")

    await expect(
        MarketPlace.connect(bob).changePrice(
            justDeployed.address,
            1,
            ethers.utils.parseEther("1")
        )
    ).to.be.revertedWith("NOT LISTING OWNER");

    await MarketPlace.changePrice(
        justDeployed.address,
        1,
        ethers.utils.parseEther("1")
    )

    await MarketPlace.connect(bob).buyNFT(
        justDeployed.address,
        1,
        {value: ethers.utils.parseEther("1")}
    )

    const ownerAfter = await justDeployed.ownerOf(1);

    expect(ownerAfter).to.equal(bob.address)

  });

  it('Nft Sell with marketplace fee', async function () {

    let addr1 = await Factory.predictAddress(0);

    await Factory.deployCollection("Best NFTs", "BNFT", owner.address, 10);

    const justDeployed = await CollectionNft.attach(
        addr1
    );

    await justDeployed.bulkMintURI([owner.address, owner.address], ["We like beans", "beans are good"]);

    await justDeployed.setApprovalForAll(MarketPlace.address, true)

    await MarketPlace.setFee(ethers.utils.parseEther("1.05"))

    await expect(
        MarketPlace.setFee(ethers.utils.parseEther("0.99"))
    ).to.be.revertedWith("NO NEGATIVE FEE")

    await expect(
        MarketPlace.setFee(ethers.utils.parseEther("1.51"))
    ).to.be.revertedWith("MAX FEE 50%")

    await MarketPlace.listNFT(
        justDeployed.address,
        1,
        ethers.utils.parseEther("5"),
        owner.address,
        false
    );

    await expect(
        MarketPlace.connect(bob).buyNFT(
            justDeployed.address,
            1,
            {value: ethers.utils.parseEther("5")}
        )
    ).to.be.revertedWith("WRONG BUYOUT AMOUNT")

    await expect(() =>
      MarketPlace.connect(bob).buyNFT(
        justDeployed.address,
        1,
        {value: ethers.utils.parseEther("5.25")}
      )
    ).to.changeEtherBalances(
        [bob, owner],
        [ethers.utils.parseEther("-5.25"), ethers.utils.parseEther("5")]
    );

    const ownerAfter = await justDeployed.ownerOf(1);

    await expect(() =>
        MarketPlace.collectFees()
    ).to.changeEtherBalance(owner, ethers.utils.parseEther("0.25"));

    await expect(
        MarketPlace.connect(bob).collectFees()
    ).to.be.revertedWith("Ownable: caller is not the owner")

    expect(ownerAfter).to.equal(bob.address)

  });

  it('Nft sell in USD using chainlink price feed', async function () {
    let addr1 = await Factory.predictAddress(0);

    await Factory.deployCollection("Best NFTs", "BNFT", owner.address, 10);

    const justDeployed = await CollectionNft.attach(
        addr1
    );

    await justDeployed.bulkMintURI([owner.address, owner.address], ["We like beans", "beans are good"]);

    await justDeployed.setApprovalForAll(MarketPlace.address, true)

    await MarketPlace.setFee(ethers.utils.parseEther("1.05"))

    await FakeChainLink.setCurrentPrice("200000000")

    await MarketPlace.listNFT(
        justDeployed.address,
        1,
        ethers.utils.parseEther("5"),
        owner.address,
        true
    );

    await MarketPlace.listNFT(
        justDeployed.address,
        2,
        ethers.utils.parseEther("5"),
        owner.address,
        true
    );

    await expect(
        MarketPlace.connect(bob).buyNFT(
            justDeployed.address,
            1,
            {value: ethers.utils.parseEther("2.5")}
        )
    ).to.be.revertedWith("WRONG BUYOUT AMOUNT")

    await expect(() =>
        MarketPlace.connect(bob).buyNFT(
            justDeployed.address,
            1,
            {value: ethers.utils.parseEther("2.625")}
        )
    ).to.changeEtherBalances(
        [bob, owner],
        [ethers.utils.parseEther("-2.625"), ethers.utils.parseEther("2.5")]
    );

    let ownerAfter = await justDeployed.ownerOf(1);

    await expect(() =>
        MarketPlace.collectFees()
    ).to.changeEtherBalance(owner, ethers.utils.parseEther("0.125"));

    await expect(
        MarketPlace.connect(bob).collectFees()
    ).to.be.revertedWith("Ownable: caller is not the owner")

    expect(ownerAfter).to.equal(bob.address)

    await FakeChainLink.setCurrentPrice("2500000000")
    await FakeChainLink.setDecimals("10")

    await expect(
        MarketPlace.connect(bob).buyNFT(
            justDeployed.address,
            2,
            {value: ethers.utils.parseEther("20")}
        )
    ).to.be.revertedWith("WRONG BUYOUT AMOUNT")

    await expect(() =>
        MarketPlace.connect(bob).buyNFT(
            justDeployed.address,
            2,
            {value: ethers.utils.parseEther("250")}
        )
    ).to.changeEtherBalances(
        [bob, owner],
        [ethers.utils.parseEther("-21"), ethers.utils.parseEther("20")]
    );

    ownerAfter = await justDeployed.ownerOf(2);

    await expect(() =>
        MarketPlace.collectFees()
    ).to.changeEtherBalance(owner, ethers.utils.parseEther("1"));

    await expect(
        MarketPlace.connect(bob).collectFees()
    ).to.be.revertedWith("Ownable: caller is not the owner")

    expect(ownerAfter).to.equal(bob.address)
  })
});
