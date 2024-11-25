const hre = require("hardhat");
const { ethers } = require('hardhat');
const fs = require('fs');

const tokens = (n) => ethers.parseEther(n.toString());

const main = async() =>{
  let owner;
  let deployedMintableNft;

  [owner] = await ethers.getSigners()

  // Deploys NFT
  const mintableNft = await ethers.getContractFactory("MintableNFT")
  deployedMintableNft = await mintableNft.deploy()
  await deployedMintableNft.waitForDeployment();
  
  // Get Contract Address
  const MintableNftAddress =  await deployedMintableNft.getAddress()
  
  // Mint NFT
  for(let i = 0; i < 5; i++){
    const mintTx = await deployedMintableNft.connect(owner).mint(`https://ipfs.io/ipfs/QmfVGoWwBZTh2ykpqysSpnWuDtLFfrxtoyipXUA4ei4s5p/meta-${i + 1}.json`)
    await mintTx.wait();
  }

  // Deploy List Contract
  const listing = await ethers.getContractFactory("List");
  deployedListing = await listing.deploy(MintableNftAddress);
  await deployedListing.waitForDeployment();

  const listingAddress =  await deployedListing.getAddress()

  // Approve Sale
  for (let i = 1; i <= 5; i++) {
    const tx = await deployedMintableNft.connect(owner).approve(deployedListing.getAddress(), i);
    await tx.wait()
  }

  // Run list function
  for (let i = 1; i <= 5; i++) {
    const tx = await deployedListing.connect(owner).list(i, tokens(100 - i * 10));
    await tx.wait();
  }

  // Update config.json
  const config = {
    "31337": {
        "mintableNft": {
          "address": MintableNftAddress
        },
        "listing": {
          "address": listingAddress
        },
    }
  };

  fs.writeFileSync('src/config.json', JSON.stringify(config, null, 2));
}

// Catches Error that come from the function
main().catch((error)=>{
  console.error(error);
  process.exitCode = 1;
})