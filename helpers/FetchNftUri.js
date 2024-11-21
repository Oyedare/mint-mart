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

const fetchNftTotalSupply = async() => {
    try {
        const mintableNFT = await getNftContract();    
        
        const totalNFTSupply = await mintableNFT.getTotalNFTSupply();
        return totalNFTSupply;
    } catch (error) {
        console.error("Error fetching NFT supply:", error);
        throw error;
    }
}

// export const fetchAllNftLinks = async () =>{
//     const mintableNFT = await getNftContract()
//     const totalNFTSupply = await fetchNftTotalSupply()
    
//     const nftMetadataLinks = [];

//     for (let i = 1; i <= totalNFTSupply; i++) {
//         const tokenURI = await mintableNFT.tokenURI(i);
//         nftMetadataLinks.push(tokenURI);
//     }
//     console.log(nftMetadataLinks);
//     return nftMetadataLinks;
// }

// export const getLastMetadataIndex = async () => {
//     const nftMetadataLinks = await fetchAllNftLinks();
//     const lastMetadataLink = nftMetadataLinks[nftMetadataLinks.length - 1];
//     const lastIndex = parseInt(lastMetadataLink.match(/meta-(\d+).json/)[1]);
//     console.log(lastIndex);
//     return lastIndex;
// };

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

export const getOwnerOfNfts = async() =>{
    const mintableNFT = await getNftContract()
    const totalNFTSupply = await fetchNftTotalSupply()

    const owners = [];

    for (let i = 1; i <= totalNFTSupply; i++) {
        const owner = await mintableNFT.ownerOf(i);        
        owners.push(owner)
    }
    return owners
}
