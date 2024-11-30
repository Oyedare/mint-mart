/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  buy,
  cancelListing,
  checkIsListed,
  listNft,
} from "../../helpers/fetchListingContract";
import { getSigner } from "../../helpers/getSigners";
import { tokens } from "../../lib/convertPriceToEthers";
import { useNavigate } from "react-router-dom";

const NftModal = ({
  isOpen,
  setIsOpen,
  collectible,
  isListed,
  setIsListed,
  isAuctioned,
  setIsAuctioned,
  highestBid,
  owner,
  setOwner,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState(false);

  const navigate = useNavigate();

  const handleNavigate = (id) =>{
    navigate(`/auction/${id}`)
  }

  const getConnectedAccount = async () => {
    try {
      const connectedAccount = await getSigner();
      setConnectedAccount(connectedAccount);
    } catch (error) {
      console.error("Error fetching connected account:", error);
      setConnectedAccount(null);
    }
  };

  useEffect(() => {
    getConnectedAccount();

    if (window.ethereum) {
      const handleAccountChange = async (accounts) => {
        if (accounts.length > 0) {
          const connectedAccount = await getSigner();
          setConnectedAccount(connectedAccount);
        } else {
          setConnectedAccount(null); // Handle account disconnect
        }
      };

      window.ethereum.on("accountsChanged", handleAccountChange);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleListing = async (tokenId, price) => {
    setIsLoading(true);
    try {
      await listNft(tokenId, tokens(price));
      let isListed = await checkIsListed(tokenId);
      setIsListed(isListed);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleSaleCancel = async (tokenId) => {
    setIsLoading(true);
    try {
      await cancelListing(tokenId);
      let isListed = await checkIsListed(tokenId);
      setIsListed(isListed);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleBuy = async (tokenId, purchasePrice) => {
    setIsLoading(true);
    try {
      const buyTx = await buy(tokenId, purchasePrice);
      setIsListed(false);
      setOwner(buyTx.from);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg max-w-2xl w-full m-4">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
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

              {collectible.attributes.map((attribute, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {attribute.trait_type}
                    </span>
                    <span className="font-bold text-lg">{attribute.value}</span>
                  </div>
                </div>
              ))}

              {isAuctioned ? (
                // Auction-related conditions
                connectedAccount.address === owner ? (
                  highestBid > 0 ? (
                    <button onClick={()=> handleNavigate(collectible.token_id)} type="button" className="nav__connect">
                      View Auction Details
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button onClick={()=> handleNavigate(collectible.token_id)} type="button" className="nav__connect">
                        View Auction Details
                      </button>

                      <button type="button" className="btn-danger">
                        {isLoading ? "Cancelling" : "Cancel Auction"}
                      </button>
                    </div>
                  )
                ) : (
                  <button onClick={()=> handleNavigate(collectible.token_id)} type="button" className="nav__connect">
                    View / Bid
                  </button>
                )
              ) : isListed ? (
                // Listing-related conditions
                connectedAccount.address === owner ? (
                  <button
                    onClick={() => handleSaleCancel(collectible.token_id)}
                    type="button"
                    className="btn-danger"
                  >
                    {isLoading ? "Cancelling" : "Cancel Sale"}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleBuy(
                        collectible.token_id,
                        collectible.purchase_price
                      )
                    }
                    type="button"
                    className="nav__connect"
                  >
                    {isLoading ? "Buying" : "Buy"}
                  </button>
                )
              ) : // Default state when neither listed nor auctioned
              connectedAccount.address === owner ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      handleListing(
                        collectible.token_id,
                        collectible.purchase_price
                      )
                    }
                    type="button"
                    className="nav__connect"
                  >
                    {isLoading ? "Listing" : "List for Sale"}
                  </button>

                  <button onClick={()=> handleNavigate(collectible.token_id)} type="button" className="nav__connect">
                    Auction for Sale
                  </button>
                </div>
              ) : (
                <p className="text-red-500">
                  Not available for sale or auction
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NftModal;
