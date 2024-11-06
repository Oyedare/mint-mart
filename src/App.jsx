
import { ethers } from 'ethers';
import './App.css'
import Navigation from './components/Navigation'
import NftCard from './components/NftCard'
import { useEffect, useState } from 'react'

import config from './config.json'

import MintableNFTABI from './abis/MintableNFT.json'

function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [collectibles, setCollectibles] = useState([])
  const [nftOwner, setNftOwner] = useState('')


  const loadBlockChainData = async() =>{
    // Set up Provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider)

    // Get Network Id and contract address from config file
    const network = await provider.getNetwork();
    const mintableNftAddress = config[network.chainId].mintableNft.address;

    // Creates an instance of the contract that can be interacted with on the application, allowing access to functions and events of the smart contract
    const mintableNFT = new ethers.Contract(mintableNftAddress, MintableNFTABI, provider);
    const totalNFTSupply = await mintableNFT.getTotalNFTSupply()
    
    const collectibles = [];

    for (let i = 1; i <= totalNFTSupply; i++) {
      const uri = await mintableNFT.tokenURI(i)
      const res = await fetch(uri)
      const metadata = await res.json()
      collectibles.push(metadata)

      const owner = await mintableNFT.ownerOf(i);
      setNftOwner(owner)
    }
    
    setCollectibles(collectibles)

    // Listen for account changes and updates the account state
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0]
      setAccount(account);
    })
  }

  useEffect(()=>{
    loadBlockChainData()
  },[])
 
  return (
    <div className='container'>
      <Navigation account = {account} setAccount={setAccount} />
      <NftCard nftOwner = {nftOwner} collectibles = {collectibles} />
    </div>
  )
}

export default App
