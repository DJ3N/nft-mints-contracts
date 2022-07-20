const { expect } = require('chai')
const { ethers, upgrades } = require('hardhat')

describe("Deploy Clones", function () {
  let Factory, FactoryDeployer, CollectionNft, owner


  beforeEach(async function () {
    [owner] = await ethers.getSigners()

    FactoryDeployer = await ethers.getContractFactory('NftFactory')

    Factory = await FactoryDeployer.deploy()

    await Factory.deployed()

    console.log(Factory.address);

    CollectionNft = await ethers.getContractFactory("MinterNftV2");

    const DefaultBase = await CollectionNft.deploy();

    await Factory.updateBase(DefaultBase.address);

    const Hmm = await DefaultBase.name();

    console.log(Hmm, "name");

    const nextIdBase = await DefaultBase.nextId();

    console.log(nextIdBase, "NIDOG")

  })

  it('Make Simple Nft Colletion', async function () {

    let addr1 = await Factory.predictAddress(0);

    console.log(addr1, "addr1");

    await Factory.deployCollection("Gr8 nft","BONG");

    let addr2 = await Factory.predictAddress(1);

    const justDeployed = await CollectionNft.attach(
        addr1
    );

    const nextId = await justDeployed.nextId();

    console.log(nextId, "NID")

    const name = await justDeployed.name();

    console.log(name, "name new");

    console.log(addr2, "addr2")

    await Factory.deployCollection("Gr8 nft","BONG");

    const justDeployedOld = await CollectionNft.attach(
        addr2
    );

    const nameOld = await justDeployedOld.name();

    console.log(nameOld, "name old");

    const nextIdOld = await justDeployedOld.nextId();

    console.log(nextIdOld, "NIDO")

    console.log(owner.address, "oner")

    await justDeployed.mint(owner.address, 1234);

    const tokenId = await justDeployed.mintIdToTokenId(1234);

    console.log(tokenId, "TID")

    await justDeployed["safeTransferFrom(address,address,uint256)"](owner.address, "0x4e2d97538aa64b44326cf2e9065b65C3805863F3", 1)


    //console.log("Here")




  })
});
