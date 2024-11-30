import { useState, useEffect } from "react";
import { Timer, Gavel, Trophy } from "lucide-react";
import {
  fetchSingleMetaData,
  getSingleNftOwner,
} from "../../helpers/FetchNftUri";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "./Navigation";
import {
  auction,
  bid,
  cancelAuction,
  fetchAuctionData,
  finalizeAuction,
} from "../../helpers/fetchListingContract";
import { convertToIsoDate } from "../../lib/convertUnixToIso";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import { toEth, tokens } from "../../lib/convertPriceToEthers";

const AuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // const [contract, setContract] = useState(null);
  const [isBiddingLoading, setIsBiddingLoading] = useState(false);
  const [isAuctionLoading, setIsAuctionLoading] = useState(false);
  const [isFinalizeAuctionLoading, setIsFinalizeAuctionLoading] =
    useState(false);
  const [isCancelAuctionLoading, setIsCancelAuctionLoading] = useState(false);

  // NFT and Account State
  const [metaData, setMetaData] = useState({});
  const [account, setAccount] = useState(null);
  const [nftOwner, setNftOwner] = useState(null);

  // Auction State
  const [timeRemaining, setTimeRemaining] = useState("");
  const [startingBid, setStartingBid] = useState(0);
  const [userBid, setUserBid] = useState(0);
  // const [bidHistory, setBidHistory] = useState([]);
  const [auctionData, setAuctionData] = useState({
    startTime: null,
    endTime: null,
    startingBid: null,
    highestBidder: null,
    highestBid: null,
  });

  // Auction Timing State
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [auctionStatus, setAuctionStatus] = useState("not_set");

  const placeBid = async () => {
    if (
      tokens(userBid) > auctionData.highestBid &&
      tokens(userBid) > auctionData.startingBid
    ) {
      setIsBiddingLoading(true);
      try {
        await bid(id, tokens(userBid));
        fetchAuction();
        toast.success(`Your bid has been placed for NFT ${id}`);

        setIsBiddingLoading(false);
      } catch (error) {
        toast.error(`An Error occurred`);
        console.error(error);
        setIsBiddingLoading(false);
      }
    } else {
      toast.error("Bid must be greater than the current highest bid");
    }
  };

  const placeAuction = async () => {
    if (startTime && endTime && startingBid) {
      setIsAuctionLoading(true);
      try {
        await auction(id, startTime, endTime, startingBid);
        fetchAuction();
        toast.success(`An Auction has been placed for NFT ${id}`);

        setIsAuctionLoading(false);
      } catch (error) {
        toast.error(`An Error occurred`);
        console.error(error);
        setIsAuctionLoading(false);
      }
    }
  };

  const handleFinalizeAuction = async () => {
    setIsFinalizeAuctionLoading(true);
    try {
      await finalizeAuction(id);
      fetchAuction();
      toast.success(`Auction for NFT ${id} has been finalized`);
      setIsFinalizeAuctionLoading(false);
      navigate("/");
    } catch (error) {
      const errorMessage = error.reason || error.message || "Unknown error";
      toast.error(`Error: ${errorMessage}`);
      console.error("Detailed Error:", error);
      setIsFinalizeAuctionLoading(false);
    }
  };

  const handleCancelAuction = async () => {
    setIsCancelAuctionLoading(true);
    try {
      await cancelAuction(id);
      fetchAuction();
      toast.success(`Auction for NFT ${id} has been terminated`);
      setIsCancelAuctionLoading(false);
    } catch (error) {
      toast.error(`An Error occurred`);
      console.error(error);
      setIsCancelAuctionLoading(false);
    }
  };

  const handleAccountConnection = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }

      // Listen for account changes
      window.ethereum.on("accountsChanged", async (accounts) => {
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

  const fetchAuction = async () => {
    const auctionData = await fetchAuctionData(id);
    setAuctionData({
      startTime: convertToIsoDate(auctionData[0]),
      endTime: convertToIsoDate(auctionData[1]),
      startingBid: auctionData[2],
      highestBidder: auctionData[3],
      highestBid: auctionData[4],
    });
    // console.log(auctionData);
  };

  useEffect(() => {
    const fetchMetaData = async () => {
      const metaData = await fetchSingleMetaData(id);
      setMetaData(metaData);

      const owner = await getSingleNftOwner(id);
      setNftOwner(owner.toLowerCase());
    };

    fetchAuction();
    fetchMetaData();
    handleAccountConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountConnection
        );
      }
    };
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      // Ensure auctionData times are valid Date objects
      const startTime = new Date(auctionData.startTime);
      const endTime = new Date(auctionData.endTime);

      // No auction times set
      if (
        startTime.toISOString() === "1970-01-01T00:00:00.000Z" ||
        endTime.toISOString() === "1970-01-01T00:00:00.000Z"
      ) {
        setTimeRemaining("Auction Not Configured");
        return;
      }

      const nowTimestamp = now.getTime();
      const startTimestamp = startTime.getTime();
      const endTimestamp = endTime.getTime();

      // Before start time
      if (nowTimestamp < startTimestamp) {
        const timeToStart = startTimestamp - nowTimestamp;

        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeToStart % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeToStart % (1000 * 60)) / 1000);

        if (timeToStart <= 5000) {
          setTimeRemaining(`Auction Starting in ${seconds}s`);
        } else if (days > 0) {
          setTimeRemaining(`Starts in ${days}d ${hours}h`);
        } else {
          setTimeRemaining(`Starts in ${hours}h ${minutes}m ${seconds}s`);
        }

        setAuctionStatus(timeToStart <= 0 ? "active" : "scheduled");
      }
      // Auction in progress
      else if (nowTimestamp >= startTimestamp && nowTimestamp < endTimestamp) {
        const timeRemaining = endTimestamp - nowTimestamp;

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeRemaining(`Ends in ${days}d ${hours}h`);
        } else {
          setTimeRemaining(`Ends in ${hours}h ${minutes}m ${seconds}s`);
        }

        setAuctionStatus("active");
      }
      // Auction ended
      else {
        setTimeRemaining("Auction Ended");
        setAuctionStatus("ended");
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionData.startTime, auctionData.endTime]);

  

  // useEffect(() => {
  //   const getListingContract = async () => {
  //     const contract = await getListingContract();
  //     setContract(contract);
  //   };
    
  //   getListingContract()

  //   contract?.on(
  //     "NewAuctionStarted",
  //     (owner, tokenId, StartingBidAmount, message) => {
  //       setBidHistory((prevBids) => [
  //         ...prevBids,
  //         { owner, tokenId, StartingBidAmount, message },
  //       ]);
  //     }
  //   );

  //   contract?.on("NewBidPlaced", (bidder, tokenId, bidAmount, message) => {
  //     setBidHistory((prevBids) => [
  //       ...prevBids,
  //       { bidder, tokenId, bidAmount, message },
  //     ]);
  //   });

  //   contract?.on("BidRefunded", (bidder, tokenId, bidAmount, message) => {
  //     setBidHistory((prevBids) => [
  //       ...prevBids,
  //       { bidder, tokenId, bidAmount, message },
  //     ]);
  //   });

  //   contract?.on("AuctionCancelled", (tokenId, owner, message) => {
  //     setBidHistory((prevBids) => [...prevBids, { tokenId, owner, message }]);
  //   });

  //   contract?.on(
  //     "AuctionFinalized",
  //     (tokenId, highestBidder, highestBid, message) => {
  //       setBidHistory((prevBid) => [
  //         ...prevBid,
  //         { tokenId, highestBidder, highestBid, message },
  //       ]);
  //     }
  //   );

  //   return () => {
  //     // Clean up event listeners on component unmount
  //     contract?.removeAllListeners();
  //   };
  // }, []);

  return (
    <div className="container">
      <Navigation account={account} setAccount={setAccount} />

      {auctionData && (
        <div className="container max-w-md mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Auction Timer and Current Bid */}
            <div className="p-4 bg-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <Timer className="mr-2 text-blue-500" />
                <span className="font-bold">{timeRemaining}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="mr-2 text-yellow-500" />
                <span className="text-lg font-semibold">
                  {auctionData.highestBid ? toEth(auctionData.highestBid) : "0"}{" "}
                  ETH
                </span>
              </div>
            </div>

            {/* NFT Details */}
            <div className="p-4">
              <img
                src={metaData.image || "/api/placeholder/400/300"}
                alt={metaData.name || "NFT Image"}
                className="w-full h-64 object-contain rounded-lg mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">
                {metaData.name || "Unnamed NFT"}
              </h2>
              <p className="text-gray-600 mb-4">
                {metaData.description || "No description available"}
              </p>

              {/* Auction Configuration for Owner */}
              {account === nftOwner && auctionStatus === "not_set" && (
                <div className="space-y-2 mb-4">
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        onChange={(e) => setStartTime(new Date(e.target.value))}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        onChange={(e) => setEndTime(new Date(e.target.value))}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="Starting Bid Amount"
                    onChange={(e) => setStartingBid(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <button
                    onClick={placeAuction}
                    className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    {isAuctionLoading ? "Configuring" : "Configure Auction"}
                  </button>
                </div>
              )}

              {/* Bidding Section */}
              {auctionStatus === "active" &&
                (account === nftOwner ? (
                  <>
                    <p className="text-gray-600 mb-4">Auction is ongoing</p>
                    <p className="text-gray-600 mb-4">
                      Starting Bid: {toEth(auctionData.startingBid)} ETH
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex space-x-2 mb-4">
                      {account === auctionData.highestBidder.toLowerCase() ? (
                        <p>
                          Chill, You are the top bidder. We may have a higher
                          bid
                        </p>
                      ) : (
                        <>
                          <input
                            type="number"
                            value={userBid}
                            onChange={(e) => setUserBid(e.target.value)}
                            placeholder="Enter bid amount"
                            className="flex-grow p-2 border rounded"
                            min={(startingBid || 0) + 1}
                          />
                          <button
                            onClick={placeBid}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                            disabled={account === nftOwner}
                          >
                            <Gavel className="mr-2" />{" "}
                            {isBiddingLoading ? "Bidding" : "Bid"}
                          </button>
                        </>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4">
                      Starting Bid: {toEth(auctionData.startingBid)} ETH
                    </p>
                  </>
                ))}

              {auctionStatus === "scheduled" &&
                (account === nftOwner ? (
                  <>
                    <button
                      onClick={handleCancelAuction}
                      className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      {isCancelAuctionLoading ? "Cancelling" : "Cancel Auction"}
                    </button>

                    <p className="text-gray-600 mb-4">
                      Starting Bid: {toEth(auctionData.startingBid)} ETH
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 mb-4">Bidding starts soon</p>
                ))}

              {auctionStatus === "ended" &&
                (account === nftOwner ? (
                  <>
                    <p className="text-gray-600 mb-4">
                      {auctionData.highestBidder === ethers.ZeroAddress ? (
                        <span>There was no bid for this auction</span>
                      ) : (
                        <span>
                          Auction is over, The winner is:{" "}
                          {auctionData.highestBidder}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={handleFinalizeAuction}
                      className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                      {isFinalizeAuctionLoading
                        ? "Finalizing"
                        : "Finalize Auction"}
                    </button>
                  </>
                ) : auctionData.highestBidder.toLowerCase() === account ? (
                  <p className="text-gray-600 mb-4">
                    Waiting for nft owner to finalize auction
                  </p>
                ) : (
                  <p className="text-gray-600 mb-4">
                    {auctionData.highestBidder === ethers.ZeroAddress ? (
                      <span>There was no bid for this auction</span>
                    ) : (
                      <span>
                        Bidding is over, The winner is:{" "}
                        {auctionData.highestBidder}
                      </span>
                    )}
                  </p>
                ))}

              {/* Bid History */}
              {/* <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Bid History</h3>
                <div className="max-h-40 overflow-y-auto">
                  {bidHistory.map((bid, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm py-1 border-b"
                    >
                      <span>{bid?.message}</span>
                      
                    </div>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default AuctionPage;
