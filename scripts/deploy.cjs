const hre = require("hardhat");
const { ethers } = require('hardhat');
const fs = require('fs');

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
    const mintTx = await deployedMintableNft.connect(owner).mint(`https://ipfs.io/ipfs/QmcJc93wkvmSB25CDd8MePzUC6oeHTgRhctenGGsgay6gx/meta-${i + 1}.json`)
    await mintTx.wait();
  }

  // Update config.json
  const config = {
    "31337": {
        "mintableNft": {
          "address": MintableNftAddress
        }
    }
  };

  fs.writeFileSync('src/config.json', JSON.stringify(config, null, 2));
}

// Catches Error that come from the function
main().catch((error)=>{
  console.error(error);
  process.exitCode = 1;
})