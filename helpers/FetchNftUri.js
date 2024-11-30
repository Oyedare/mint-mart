import config from '../src/config.json'
import { ethers } from 'ethers';
import MintableNFTABI from '../src/abis/MintableNFT.json'

export const getNftContract = async () =>{
    // Set up Provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Get Network Id and contract address from config file
    const network = await provider.getNetwork();
    const mintableNftAddress = config[network.chainId]?.mintableNft?.address;

    // Creates an instance of the contract that can be interacted with on the application, allowing access to functions and events of the smart contract
    const mintableNFT = new ethers.Contract(mintableNftAddress, MintableNFTABI, provider);  
    return mintableNFT
}

export const fetchNftTotalSupply = async() => {
    try {
        const mintableNFT = await getNftContract();    
        
        const totalNFTSupply = await mintableNFT.getTotalNFTSupply();
        return totalNFTSupply;
    } catch (error) {
        console.error("Error fetching NFT supply:", error);
        throw error;
    }
}

export const fetchAllNftMetaData = async () =>{
    const mintableNFT = await getNftContract()
    const totalNFTSupply = await fetchNftTotalSupply()    
    
    const collectibles = [];

    for (let i = 1; i <= totalNFTSupply; i++) {
      const uri = await mintableNFT.tokenURI(i)
      const res = await fetch(uri)
      const metadata = await res.json()
      collectibles.push(metadata)
    }
    return collectibles;
}

export const fetchSingleMetaData = async (tokenId) =>{
    const mintableNFT = await getNftContract()
    const uri = await mintableNFT.tokenURI(tokenId)
    const res = await fetch(uri)
    const metadata = await res.json()
    return metadata
}

export const getOwnerOfNfts = async() =>{
    const mintableNFT = await getNftContract()
    const totalNFTSupply = await fetchNftTotalSupply()

    const owners = [];

    for (let i = 1; i <= totalNFTSupply; i++) {
        const owner = await mintableNFT.ownerOf(i);        
        owners.push(owner)
    }
    return owners;
}

export const getSingleNftOwner = async (tokenId) =>{
    const mintableNFT = await getNftContract()
    const owner = await mintableNFT.ownerOf(tokenId);        
    return owner;
}
