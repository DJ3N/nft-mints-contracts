const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Market", function () {
  let Factory, FactoryDeployer, MarketPlaceDeployer, MarketPlace, CollectionNft, owner, bob, alice



  beforeEach(async function () {
    [owner, bob, alice] = await ethers.getSigners();

    FactoryDeployer = await ethers.getContractFactory('NftFactory')

    Factory = await FactoryDeployer.deploy()

    MarketPlaceDeployer = await ethers.getContractFactory('SimpleMarketPlace')

    MarketPlace = await MarketPlaceDeployer.deploy()

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
    ).to.be.revertedWith("Wrong Buyout Amount")

    await MarketPlace.connect(bob).buyNFT(
        justDeployed.address,
        1,
        { value: ethers.utils.parseEther("5") }
    )
  })
});
