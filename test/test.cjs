const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => ethers.parseEther(n.toString());

describe("Test mint function", () => {
    let owner, buyer;
    let deployedMintableNft, deployedListing;

    beforeEach(async()=>{
        [owner, buyer] = await ethers.getSigners()

        // Deploys NFT
        const mintableNft = await ethers.getContractFactory("MintableNFT")
        deployedMintableNft = await mintableNft.deploy()
        await deployedMintableNft.waitForDeployment();
        const MintableNftAddress =  await deployedMintableNft.getAddress()                

        // Mint NFT
        const mintTx = await deployedMintableNft.connect(owner).mint("https://ipfs.io/ipfs/QmcJc93wkvmSB25CDd8MePzUC6oeHTgRhctenGGsgay6gx/meta-1.json")
        await mintTx.wait();

        // Deploy listing contract
        const listing = await ethers.getContractFactory("List");
        deployedListing = await listing.deploy(MintableNftAddress);
        await deployedListing.waitForDeployment();

        // Approve sale of nft
        let tx = await deployedMintableNft.connect(owner).approve(deployedListing.getAddress(), 1);
        await tx.wait()
        
        // Run list function
        tx = await deployedListing.connect(owner).list(1, tokens(10));
        await tx.wait();
    })

    it("checks the total supply of NFT", async() =>{
        const totalSupply = await deployedMintableNft.getTotalNFTSupply();
        expect(totalSupply).to.be.equal(1)
    })

    describe("Describes listing process", ()=>{
        it("checks if signer is the owner of the nft", async()=>{
            const nftOwner = await deployedMintableNft.ownerOf(1);
            expect(nftOwner).to.be.equal(owner)
        })
        it("runs checks on listing status", async()=>{
            const isListed = await deployedListing.isListed(1)
            expect(isListed).to.be.equal(true)
        })

        it("runs checks on listing price", async()=>{
            const purchasePrice = await deployedListing.purchasePrice(1)
            expect(purchasePrice).to.be.equal(tokens(10))
        })
    })

    describe("Describes buying process", ()=>{
        let ownerBalanceBefore;
        beforeEach(async()=>{
            ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            const buyTx = await deployedListing.connect(buyer).buy(1, {
                value: tokens(10)
            })
            await buyTx.wait()
        })
        it("updates ownership of nft", async()=>{
            const newNftOwner = await deployedMintableNft.ownerOf(1)
            expect(newNftOwner).to.be.equal(buyer.address)
        })

        it("checks succesful transfer of funds", async()=>{
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
            expect(ownerBalanceAfter - ownerBalanceBefore).to.be.equal(tokens(10))
        })

        it("checks if sale cancels", async()=>{
            beforeEach(async()=>{
                const tx = await deployedListing.connect(owner).cancelSale(1);
                await tx.wait();
            })
            const isListed = await deployedListing.isListed(1)
            expect(isListed).to.be.equal(false)
        })
    })
})