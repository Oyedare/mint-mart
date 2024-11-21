import { getNftContract } from "./FetchNftUri";
import { getSigner } from "./getSigners";

export const mintNewNFT = async (metadataLink) => {
    let mintableNft, signer;

    try {
      signer = await getSigner();
      
      mintableNft = await getNftContract();

      const mintTx = await mintableNft.connect(signer).mint(metadataLink);
      await mintTx.wait();
      
      return mintTx;
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
};