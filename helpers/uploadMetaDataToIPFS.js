import axios from "axios";
import { uploadFileToIPFS } from "./uploadImagesToIPFS";
import { constructMetadata } from "./ConstructMetaData";

export const uploadNewMetadata = async (tokenId,name, description, image, purchasePrice, color, strength, rarity, powerLevel) => {
    const imageHash = await uploadFileToIPFS(image);
    const metadata = constructMetadata(tokenId,name, description, imageHash, purchasePrice, color, strength, rarity, powerLevel);
    const fileName = `meta-${name}.json`;
    
    try {
        const pinataBody = {
            pinataOptions: {
                cidVersion: 1,
                wrapWithDirectory: false,
            },
            pinataMetadata: {
                name: fileName,
            },
            pinataContent: metadata,
        };
        
        const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", pinataBody, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_JWT}`,
            }
        });
        
        return `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading metadata:", error);
    }
};
