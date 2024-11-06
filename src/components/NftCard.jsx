/* eslint-disable react/prop-types */
import { useState } from 'react'
import NftModal from './NftModal';

const NftCard = ({collectibles, nftOwner}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [collectible,setCollectible] = useState({})

    const toggle = (collectible) =>{
        setCollectible(collectible)
        setIsOpen(true)
    }
    return (
        <>
            <div className="flex items-center gap-8 flex-wrap mt-8" >
                {collectibles.map((collectible, i)=>(
                    <div 
                    className="w-72 rounded-lg shadow-lg overflow-hidden bg-white transition-transform duration-200 hover:scale-105 cursor-pointer"
                    onClick={() => toggle(collectible)}
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
                            <span className="text-sm text-gray-600">Owner: {nftOwner.slice(0, 6) + '...' + nftOwner.slice(38, 42)}</span>
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

                />
            )}
        </>
    );
}

export default NftCard