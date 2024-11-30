import { ethers } from "ethers";
import config from "../src/config.json";
import ListingABI from "../src/abis/List.json";
import { getSigner } from "./getSigners";
import { tokens } from "../lib/convertPriceToEthers";
import { getNftContract } from "./FetchNftUri";
import { convertToUnix } from "../lib/convertTimeToUnix";

export const getListingContract = async () => {
  // Set up Provider
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Get Network Id and contract address from config file
  const network = await provider.getNetwork();
  const listingAddress = config[network.chainId]?.listing?.address;

  // Creates an instance of the contract that can be interacted with on the application, allowing access to functions and events of the smart contract
  const listing = new ethers.Contract(listingAddress, ListingABI, provider);
  return listing;
};

export const getListingSignerContract = async () => {
  // Set up Provider
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Get Network Id and contract address from config file
  const network = await provider.getNetwork();
  const listingAddress = config[network.chainId]?.listing?.address;

  const signer = await getSigner();

  // Creates an instance of the contract that can be interacted with on the application, allowing access to functions and events of the smart contract
  const listing = new ethers.Contract(listingAddress, ListingABI, signer);
  return listing;
};

export const listNft = async (tokenId, price) => {
  const signer = await getSigner();
  const listingContract = await getListingContract();
  const mintableNFT = await getNftContract();

  const approveTx = await mintableNFT
    .connect(signer)
    .approve(listingContract.getAddress(), tokenId);
  await approveTx.wait();

  const listTx = await listingContract.connect(signer).list(tokenId, price);
  await listTx.wait();
  return listTx;
};

export const cancelListing = async (tokenId) => {
  const signer = await getSigner();
  const listingContract = await getListingContract();
  const cancelListingTx = await listingContract
    .connect(signer)
    .cancelSale(tokenId);
  await cancelListingTx.wait();
  return cancelListingTx;
};

export const buy = async (tokenId, purchasePrice) => {
  const signer = await getSigner();
  const listingContract = await getListingContract();
  const value = tokens(purchasePrice);

  const buyTx = await listingContract.connect(signer).buy(tokenId, { value });
  await buyTx.wait();
  return buyTx;
};

export const checkIsListed = async (tokenId) => {
  const listingContract = await getListingContract();

  const isListed = await listingContract.isListed(tokenId);
  return isListed;
};

export const bid = async (tokenId, bidAmount) => {
  const listingContract = await getListingContract();
  const signer = await getSigner();

  let tx = await listingContract
    .connect(signer)
    .bid(tokenId, { value: bidAmount });
  await tx.wait();

  return tx;
};

export const auction = async (tokenId, startTime, endTime, startingBid) => {
  const listingContract = await getListingContract();
  const signer = await getSigner();

  let tx = await listingContract
    .connect(signer)
    .auction(
      tokenId,
      convertToUnix(startTime),
      convertToUnix(endTime),
      tokens(startingBid)
    );
  await tx.wait();

  return tx;
};

export const finalizeAuction = async (tokenId) => {
  const listingContract = await getListingContract();
  const signer = await getSigner();

  let tx = await listingContract.connect(signer).finalizeAuction(tokenId);
  await tx.wait();
  console.log(tx);
  return tx;
};

export const cancelAuction = async (tokenId) => {
  const listingContract = await getListingContract();
  const signer = await getSigner();

  let tx = await listingContract.connect(signer).cancelAuction(tokenId);
  await tx.wait();

  return tx;
};

export const checkIsAuctioned = async (tokenId) => {
  const listingContract = await getListingContract();

  const isAuctioned = listingContract.isAuctioned(tokenId);
  return isAuctioned;
};

export const fetchAuctionData = async (tokenId) => {
  const listingContract = await getListingContract();

  const auctionData = listingContract.auctions(tokenId);
  return auctionData;
};

export const fetchHighestBid = async (tokenId) => {
  const listingContract = await getListingContract();

  const highestBid = listingContract.getHighestBid(tokenId);
  return highestBid;
};
