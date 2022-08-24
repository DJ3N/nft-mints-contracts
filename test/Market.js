const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Market", function () {
  let Factory, FactoryDeployer, MarketPlaceDeployer, MarketPlace, CollectionNft, owner, bob, alice



  beforeEach(async function () {
    [owner, bob, alice] = await ethers.getSigners();

    FactoryDeployer = await ethers.getContractFactory('NftFactory')

    Factory = await FactoryDeployer.deploy()

    MarketPlaceDeployer = await ethers.getContractFactory('SimpleMarketPlace')

    MarketPlace = await MarketPlaceDeployer.deploy(ethers.utils.parseEther("1"))

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
      owner.address
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
        owner.address
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
        owner.address
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
});
