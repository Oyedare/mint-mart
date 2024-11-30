/* eslint-disable react/prop-types */
import { useState } from 'react'
import NftModal from './NftModal';
import { checkIsAuctioned, checkIsListed, fetchHighestBid } from '../../helpers/fetchListingContract';

const NftCard = ({collectibles, nftOwners}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [collectible,setCollectible] = useState({})
    const [isListed, setIsListed] = useState(null)
    const [isAuctioned, setIsAuctioned] = useState(null)
    const [highestBid, sethighestBid] = useState(null)
    const [owner, setOwner] = useState(null)

    const toggle = async(collectible, nftOwners) =>{
        setCollectible(collectible)
        setOwner(nftOwners)
        let isListed = await checkIsListed(collectible.token_id)
        let isAuctioned = await checkIsAuctioned(collectible.token_id)
        let highestBid = await fetchHighestBid(collectible.token_id)
        setIsListed(isListed)
        setIsAuctioned(isAuctioned)
        sethighestBid(highestBid)
        setIsOpen(true)
    }
    return (
        <>
            <div className="flex items-center gap-8 flex-wrap mt-8" >
                {[...collectibles].reverse().map((collectible, i)=>(
                    <div 
                    className="w-72 rounded-lg shadow-lg overflow-hidden bg-white transition-transform duration-200 hover:scale-105 cursor-pointer"
                    onClick={() => toggle(collectible, [...nftOwners].reverse()[i])}
                    key={i}
                    >
                        <div className="h-48 overflow-hidden">
                            <img 
                            src={collectible.image}
                            alt={collectible.name}
                            className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-bold mb-2">{collectible.name}</h3>
                            <p className="text-sm text-gray-600">
                            {collectible.description}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50">
                            <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-lg">{collectible.purchase_price}ETH</span>
                            {nftOwners.length > 0 && (
                                <span className="text-sm text-gray-600">Owner: {[...nftOwners]?.reverse()[i].slice(0, 6) + '...' + [...nftOwners]?.reverse()[i].slice(38, 42)}</span>
                            )}
                            </div>
                        </div>
                    </div>
                ))} 
            </div>

            {isOpen && (
                <NftModal 
                    isOpen={isOpen} 
                    setIsOpen={setIsOpen}
                    collectible={collectible}
                    isListed = {isListed}
                    setIsListed = {setIsListed}
                    isAuctioned = {isAuctioned}
                    setIsAuctioned = {setIsAuctioned}
                    highestBid = {highestBid}
                    owner = {owner}
                    setOwner = {setOwner}
                />
            )}
        </>
    );
}

export default NftCard