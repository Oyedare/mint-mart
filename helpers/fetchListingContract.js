import { ethers } from "ethers";
import config from '../src/config.json';
import ListingABI from '../src/abis/List.json';
import { getSigner } from "./getSigners";
import { tokens } from "../lib/convertPriceToEthers";
import { getNftContract } from "./FetchNftUri";

export const getListingContract = async () =>{
    // Set up Provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Get Network Id and contract address from config file
    const network = await provider.getNetwork();
    const listingAddress = config[network.chainId]?.listing?.address;

    // Creates an instance of the contract that can be interacted with on the application, allowing access to functions and events of the smart contract
    const listing = new ethers.Contract(listingAddress, ListingABI, provider);    
    return listing
}

export const listNft = async (tokenId, price) =>{
    const signer = await getSigner();
    const listingContract = await getListingContract();
    const mintableNFT = await getNftContract();    

    const approveTx = await mintableNFT.connect(signer).approve(listingContract.getAddress(), tokenId);
    await approveTx.wait();
    
    const listTx = await listingContract.connect(signer).list(tokenId, price)
    await listTx.wait();
    return listTx
}

export const cancelListing = async (tokenId) =>{
    const signer = await getSigner();
    const listingContract = await getListingContract();
    const cancelListingTx = await listingContract.connect(signer).cancelSale(tokenId)
    await cancelListingTx.wait();
    return cancelListingTx
}

export const buy = async (tokenId, purchasePrice) =>{
    const signer = await getSigner();
    const listingContract = await getListingContract();
    const value = tokens(purchasePrice)
    
    const buyTx = await listingContract.connect(signer).buy(tokenId, {value})
    await buyTx.wait();
    console.log(buyTx);
    return buyTx
}

export const checkIsListed = async (tokenId) =>{
    const listingContract = await getListingContract();

    const isListed = await listingContract.isListed(tokenId)
    return isListed;
}