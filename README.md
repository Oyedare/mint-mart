# Mint Mart 🚀

An advanced NFT Marketplace deployed on the **Sepolia testnet**, enabling users to mint, buy, sell, and auction NFTs seamlessly. Built with cutting-edge web technologies and Solidity, this project showcases a secure, user-friendly, and feature-rich platform for decentralized digital asset trading.

---

## Features

### Core Functionalities
1. **Dynamic NFT Minting**
   - User-submitted metadata is uploaded to IPFS (via Pinata) and linked dynamically during minting.
   - Pre-minted NFTs with static metadata stored on IPFS.

2. **Buy Now Feature**
   - Direct purchase of listed NFTs with secure ETH payments.
   - Listing and unlisting NFTs for sale by owners.

3. **Auction and Bidding System** *(Milestone 3)*
   - Timed auctions with real-time bidding functionality.
   - Auction finalization logic ensuring secure transfer of NFTs and funds.

### Blockchain Integration
- **ERC721 Compliance**: NFTs adhere to the Ethereum standard for interoperability and secure ownership transfer.
- **TokenURI Management**: Metadata retrieval via `tokenURI` function linked to IPFS metadata.
- **Real-Time Interaction**: User interactions recorded on the blockchain (Sepolia) with detailed transaction receipts.

### Frontend
- Built with **React** and styled using **Tailwind CSS**.
- Real-time NFT listings and dynamic updates after minting.
- Seamless interaction with the smart contract using **ethers.js**.

---

## Technologies Used

### Smart Contracts
- **Solidity**: Developed with optimized and secure code patterns.
- **Hardhat**: For local blockchain development, testing, and deployment.
- **Sepolia Testnet**: Deployed for real-world testing.

### Frontend Development
- **React**: For building a fast, responsive user interface.
- **Tailwind CSS**: For consistent and efficient styling.
- **IPFS (Pinata)**: For decentralized metadata storage.

### Testing
- **Chai**: Comprehensive unit tests for smart contracts.
- **Hardhat Network**: Local testing environment for blockchain interactions.

---

## Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js**: v14 or later
- **Hardhat**: Installed globally via npm
- **Metamask**: Browser wallet extension for testing

### Clone the Repository
```bash
git clone https://github.com/Oyedare/mint-mart.git
cd mint-mart
```
### Install Dependencies
```bash
npm install
```
### Deployment on Sepolia
The marketplace smart contract is deployed on the Sepolia testnet. Update the .env file with your credentials and run:
```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```
### Run Locally
Start the local development server:
```bash
npm run dev
```

---

## How It Works
1. **Minting NFTs**
   - Input NFT details (name, description, and image)
   - Upload metadata to IPFS and mint on Sepolia.

2. **Buying and Selling**
   - List NFTs for sale and allow direct purchases with ETH.
   - Secure transactions recorded on the blockchain.

3. **Auctions**
   - Place bids on listed NFTs during the auction window.
   - Highest bid wins the NFT when the auction ends.

---
     
## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
