/* eslint-disable react/prop-types */
const NftModal = ({ isOpen, setIsOpen, collectible}) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg max-w-2xl w-full m-4">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
  
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{collectible.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full h-64 overflow-hidden rounded-lg">
                <img 
                  src={collectible.image}
                  alt={collectible.name}
                  width={400}
                  height={320}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="space-y-4">
                <p className="text-base text-gray-600">
                  {collectible.description}
                </p>
                <p className="text-base text-gray-600">
                  {collectible.purchase_price}ETH
                </p>
                
                {collectible.attributes.map((attribute, index)=>(
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{attribute.trait_type}</span>
                      <span className="font-bold text-lg">{attribute.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default NftModal