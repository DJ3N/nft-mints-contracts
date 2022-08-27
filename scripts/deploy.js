const {ethers} = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const NftFactoryDeployer = await ethers.getContractFactory("NftFactory");
    const NftFactory = await NftFactoryDeployer.deploy();

    const MarketPlaceDeployer = await ethers.getContractFactory('SimpleMarketPlace')
    const MarketPlace = await MarketPlaceDeployer.deploy(ethers.utils.parseEther("1.05"), "0x0000000000000000000000000000000000000000")

    console.log("NftFactory address:", NftFactory.address);
    console.log("MarketPlace address:", MarketPlace.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
