const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Deploy Clones", function () {
  let Factory, FactoryDeployer, CollectionNft, owner


  beforeEach(async function () {
    [owner] = await ethers.getSigners()

    FactoryDeployer = await ethers.getContractFactory('NftFactory')

    Factory = await FactoryDeployer.deploy()

    await Factory.deployed()

    CollectionNft = await ethers.getContractFactory("MinterNftV2");

    const DefaultBase = await CollectionNft.deploy();

    await Factory.updateBase(DefaultBase.address);

  })

  it('Make Simple Nft Colletion', async function () {

    let addr1 = await Factory.predictAddress(0);

    await Factory.deployCollection("Best NFTs", "BNFT", owner.address, 10);

    const justDeployed = await CollectionNft.attach(
        addr1
    );

    const nextId = await justDeployed.nextId();

    const name = await justDeployed.name();

    await Factory.deployCollection("Gr8 nft","BONG", owner.address, 20);

    let addr2 = await Factory.predictAddress(1);

    const justDeployedOld = await CollectionNft.attach(
        addr2
    );

    const nameOld = await justDeployedOld.name();

    const nextIdOld = await justDeployedOld.nextId();

    await justDeployed.mintCallbackURI(owner.address, 1234, "HI");

    await justDeployed["safeTransferFrom(address,address,uint256)"](owner.address, "0x4e2d97538aa64b44326cf2e9065b65C3805863F3", 1)
  })

  it('Only Owner can create new nfts in collection', async function () {

  })

  it('Collection prevents minting once cap is reached', async function () {

  })

  it('Bulk mint correctly mints tokens with specified uris', async function () {

  })
});
