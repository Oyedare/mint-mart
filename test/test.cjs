const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => ethers.parseEther(n.toString());

describe("Test mint function", () => {
  let owner, buyer;
  let deployedMintableNft, deployedListing;

  beforeEach(async () => {
    [owner, buyer, bidder1, bidder2, bidder3] = await ethers.getSigners();

    // Deploys NFT
    const mintableNft = await ethers.getContractFactory("MintableNFT");
    deployedMintableNft = await mintableNft.deploy();
    await deployedMintableNft.waitForDeployment();
    const MintableNftAddress = await deployedMintableNft.getAddress();

    // Mint NFT
    const mintTx = await deployedMintableNft
      .connect(owner)
      .mint(
        "https://ipfs.io/ipfs/QmcJc93wkvmSB25CDd8MePzUC6oeHTgRhctenGGsgay6gx/meta-1.json"
      );
    await mintTx.wait();

    // Deploy listing contract
    const listing = await ethers.getContractFactory("List");
    deployedListing = await listing.deploy(MintableNftAddress);
    await deployedListing.waitForDeployment();

    // Approve sale of nft
    let tx = await deployedMintableNft
      .connect(owner)
      .approve(deployedListing.getAddress(), 1);
    await tx.wait();

    // Run list function
    tx = await deployedListing.connect(owner).list(1, tokens(10));
    await tx.wait();
  });

  it("checks the total supply of NFT", async () => {
    const totalSupply = await deployedMintableNft.getTotalNFTSupply();
    expect(totalSupply).to.be.equal(1);
  });

  describe("Describes listing process", () => {
    it("checks if signer is the owner of the nft", async () => {
      const nftOwner = await deployedMintableNft.ownerOf(1);
      expect(nftOwner).to.be.equal(owner);
    });
    it("runs checks on listing status", async () => {
      const isListed = await deployedListing.isListed(1);
      expect(isListed).to.be.equal(true);
    });

    it("runs checks on listing price", async () => {
      const purchasePrice = await deployedListing.purchasePrice(1);
      expect(purchasePrice).to.be.equal(tokens(10));
    });
  });

  describe("Describes auction process", () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime + 60;
    const endTime = startTime + 3600;

    beforeEach(async () => {
      let tx = await deployedListing
        .connect(owner)
        .auction(1, startTime, endTime, tokens(10));
      await tx.wait();
    });

    it("checks if start time is accurate", async () => {
      const auctionStruct = await deployedListing.auctions(1);
      expect(auctionStruct.startTime).to.be.equal(startTime);
    });

    it("checks if end time is accurate", async () => {
      const auctionStruct = await deployedListing.auctions(1);
      expect(auctionStruct.endTime).to.be.equal(endTime);
    });

    it("checks if starting bid is accurate", async () => {
      const auctionStruct = await deployedListing.auctions(1);
      expect(auctionStruct.startingBid).to.be.equal(tokens(10));
    });

    it("checks the current highest Bidder", async () => {
      const auctionStruct = await deployedListing.auctions(1);
      expect(auctionStruct.highestBidder).to.be.equal(ethers.ZeroAddress);
    });

    it("checks the current highest Bidder", async () => {
      const auctionStruct = await deployedListing.auctions(1);
      expect(auctionStruct.highestBid).to.be.equal(0);
    });

    it("checks if auction has been placed", async () => {
      const isAuctioned = await deployedListing.isAuctioned(1);
      expect(isAuctioned).to.be.equal(true);
    });
  });

  describe("Describe Auction Cancellation", () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime + 120;
    const endTime = startTime + 3600;

    beforeEach(async () => {
      let tx = await deployedListing
        .connect(owner)
        .auction(1, startTime, endTime, tokens(10));
      await tx.wait();

      let cancelTx = await deployedListing.connect(owner).cancelAuction(1);
      await cancelTx.wait();
    });

    it("checks if auctioned has been cancelled", async () => {
      const isAuctioned = await deployedListing.isAuctioned(1);
      expect(isAuctioned).to.be.equal(false);
    });
  });

  describe("Bidding Process", () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime + 120;
    const endTime = startTime + 3600;

    beforeEach(async () => {
      let tx = await deployedListing
        .connect(owner)
        .auction(1, startTime, endTime, tokens(10));
      await tx.wait();
    });

    it("allows someone to place a bid", async () => {
      let initialBid = tokens(30);
      let bidTx = await deployedListing
        .connect(bidder1)
        .bid(1, { value: initialBid });
      await bidTx.wait();

      const auctionData = await deployedListing.auctions(1);
      expect(auctionData.highestBid).to.equal(initialBid);
      expect(auctionData.highestBidder).to.equal(bidder1.address);
    });

    it("reverts if bid is not higher than current bid", async () => {
      let newBid = tokens(10);
      let bidTx = await deployedListing
        .connect(bidder2)
        .bid(1, { value: newBid });
      await bidTx.wait();

      expect(bidTx).to.be.revertedWith(
        "Your bid must be higher than the current highest bid"
      );
    });

    it("refunds previous highest bidder after outbid", async () => {
      let initialBid = tokens(30);
      let newBid = tokens(50);

      let bidTx = await deployedListing
        .connect(bidder1)
        .bid(1, { value: initialBid });
      await bidTx.wait();

      let auctionData = await deployedListing.auctions(1);
      const previousHighestBidder = auctionData.highestBidder;
      const previousHighestBidderBalanceBeforeRefund =
        await ethers.provider.getBalance(previousHighestBidder);

      bidTx = await deployedListing.connect(bidder2).bid(1, { value: newBid });
      await bidTx.wait();
      auctionData = await deployedListing.auctions(1);
      expect(auctionData.highestBid).to.be.equal(newBid);

      const previousHighestBidderBalanceAfterRefund =
        await ethers.provider.getBalance(previousHighestBidder);
      expect(previousHighestBidderBalanceAfterRefund).to.be.gt(
        previousHighestBidderBalanceBeforeRefund
      );
    });

    it("emits events when a new bid is placed", async function () {
      const bidAmount = tokens(70);
      const bidTx = deployedListing
        .connect(bidder1)
        .bid(1, { value: bidAmount });
      await expect(bidTx)
        .to.emit(deployedListing, "NewBidPlaced")
        .withArgs(bidder1.address, 1, bidAmount, "A new bid has been placed");
    });
  });

  describe("finalize auction", () => {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime + 120;
    const endTime = startTime + 3600;

    beforeEach(async () => {
      let tx = await deployedListing
        .connect(owner)
        .auction(1, startTime, endTime, tokens(10));
      await tx.wait();
    });

    it("checks and finalize auction sale", async () => {
      const initialBid = tokens(100);
      const newBid = tokens(120);

      let bidTx = await deployedListing
        .connect(bidder1)
        .bid(1, { value: initialBid });
      await bidTx.wait();

      bidTx = await deployedListing.connect(bidder2).bid(1, { value: newBid });
      await bidTx.wait();

      // Fast-forward time to after the auction end time
      const latestBlock = await ethers.provider.getBlock("latest");
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        latestBlock.timestamp + 4000,
      ]);
      await ethers.provider.send("evm_mine");

      const sellerBalanceBefore = await ethers.provider.getBalance(
        owner.address
      );
      let finalizeTx = await deployedListing.connect(owner).finalizeAuction(1);
      await finalizeTx.wait();
      const sellerBalanceAfter = await ethers.provider.getBalance(
        owner.address
      );

      const auctionData = await deployedListing.auctions(1);

      expect(auctionData.highestBid).to.equal(0);
      expect(await deployedMintableNft.ownerOf(1)).to.equal(bidder2.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(newBid);
    });
  });

  describe("Describes buying process", () => {
    let ownerBalanceBefore;
    beforeEach(async () => {
      ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const buyTx = await deployedListing.connect(buyer).buy(1, {
        value: tokens(10),
      });
      await buyTx.wait();
    });
    it("updates ownership of nft", async () => {
      const newNftOwner = await deployedMintableNft.ownerOf(1);
      expect(newNftOwner).to.be.equal(buyer.address);
    });

    it("checks succesful transfer of funds", async () => {
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.be.equal(tokens(10));
    });

    it("checks if sale cancels", async () => {
      beforeEach(async () => {
        const tx = await deployedListing.connect(owner).cancelSale(1);
        await tx.wait();
      });
      const isListed = await deployedListing.isListed(1);
      expect(isListed).to.be.equal(false);
    });
  });
});
