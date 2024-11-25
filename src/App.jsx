import './App.css'
import Navigation from './components/Navigation'
import NftCard from './components/NftCard'
import { useEffect, useState } from 'react'

import { fetchAllNftMetaData, getOwnerOfNfts } from '../helpers/FetchNftUri';

function App() {
  const [account, setAccount] = useState(null)
  const [collectibles, setCollectibles] = useState([])
  const [nftOwners, setNftOwners] = useState([])

  const handleAccountConnection = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    } catch (error) {
      console.error("Error checking MetaMask connection:", error);
    }
  };
   
  const loadBlockChainData = async() =>{
    const collectibles = await fetchAllNftMetaData()
    setCollectibles(collectibles)    

    const owners = await getOwnerOfNfts()
    setNftOwners(owners)
  }

  useEffect(() => {  
    handleAccountConnection();
    loadBlockChainData();
  
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountConnection);
      }
    };
  }, []);

 
  return (
    <div className='container'>
      <Navigation account = {account} setAccount={setAccount} />
      <NftCard nftOwners = {nftOwners} collectibles = {collectibles} />

    </div>
  )
}

export default App
