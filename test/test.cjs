const { expect } = require('chai');
const hre = require("hardhat");
const { ethers } = require('hardhat');

describe("Test mint function", () => {
    let owner;
    let deployedMintableNft;

    beforeEach(async()=>{
        [owner] = await ethers.getSigners()

        // Deploys NFT
        const mintableNft = await ethers.getContractFactory("MintableNFT")
        deployedMintableNft = await mintableNft.deploy()
        await deployedMintableNft.waitForDeployment();

        // Mint NFT
        const mintTx = await deployedMintableNft.connect(owner).mint("https://ipfs.io/ipfs/QmcJc93wkvmSB25CDd8MePzUC6oeHTgRhctenGGsgay6gx/meta-1.json")
        await mintTx.wait();
    })

    it("checks the total supply of NFT", async() =>{
        const totalSupply = await deployedMintableNft.getTotalNFTSupply();
        expect(totalSupply).to.be.equal(1)
    })

})