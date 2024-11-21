/* eslint-disable react/prop-types */
import { useState } from 'react';
import SuccessModal from './SuccessModal';
import FailModal from './FailModal';
// import { getLastMetadataIndex } from '../../helpers/FetchNftUri';
import { uploadNewMetadata } from '../../helpers/uploadMetaDataToIPFS';
import { mintNewNFT } from '../../helpers/mintNewNft';

const NFTCreateForm = ({setIsFormOpen}) => {
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [color, setColor] = useState('');
  const [strength, setStrength] = useState(0);
  const [rarity, setRarity] = useState('');
  const [powerLevel, setPowerLevel] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);

  const closeForm = () => {
    setIsFormOpen(false);
  };

const handleMint = async () => {
    try{
        setIsLoading(true)
        // const lastIndex = await getLastMetadataIndex();
        const newMetadataLink = await uploadNewMetadata(name, description, image, purchasePrice, color, strength, rarity, powerLevel);
        await mintNewNFT(newMetadataLink);
        setShowSuccessModal(true)
        closeForm()
    }catch(error){
        console.error(error)
        setShowFailureModal(true)
    }finally{
        setIsLoading(false)
    }
};

  return (
    <>
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white my-8 rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Create NFT</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block font-medium mb-2">
                            NFT Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="name" className="block font-medium mb-2">
                            Purchase Price
                        </label>
                        <input
                            id="purchase_price"
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block font-medium mb-2">
                            Color
                        </label>
                        <input
                            id="color"
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block font-medium mb-2">
                            Strength
                        </label>
                        <input
                            id="strength"
                            type="number"
                            value={strength}
                            onChange={(e) => setStrength(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block font-medium mb-2">
                            Rarity
                        </label>
                        <input
                            id="rarity"
                            type="text"
                            value={rarity}
                            onChange={(e) => setRarity(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="name" className="block font-medium mb-2">
                            Power Level
                        </label>
                        <input
                            id="power_level"
                            type="text"
                            value={powerLevel}
                            onChange={(e) => setPowerLevel(e.target.value)}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <img
                            src={image ? URL.createObjectURL(image) : '/api/placeholder/400/320'}
                            alt="NFT Preview"
                            className="w-40 h-40 object-cover rounded"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0])}
                            className="border rounded-md px-3 py-2 w-full"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                    <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded"
                    onClick={closeForm}
                    >
                    Close
                    </button>
                    <button
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleMint}
                    disabled={isLoading}
                    >
                    {isLoading ? 'Loading...' : 'Mint'}
                    </button>
                </div>
            </div>
          </div>
        </div>

      {showSuccessModal && (
        <SuccessModal setShowSuccessModal={setShowSuccessModal}/>
      )}

      {showFailureModal && (
        <FailModal setShowFailureModal={setShowFailureModal}/>
      )}
    </>
  );
};

export default NFTCreateForm;