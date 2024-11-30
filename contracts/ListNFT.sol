// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;

    function ownerOf(uint256 _tokenId) external view returns (address);
}

contract List{
    address public nftAddress;

    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => bool) public isListed;
    mapping(uint256 => bool) public isAuctioned;
    mapping(uint256 => Auction) public auctions;

    event NewAuctionStarted(address indexed owner, uint256 indexed tokenId, uint256 indexed StartingBidAmount, string message);
    event NewBidPlaced(address indexed bidder, uint256 indexed tokenId, uint256 indexed bidAmount, string message);
    event BidRefunded(address indexed bidder, uint256 indexed tokenId, uint256 indexed bidAmount, string message);
    event AuctionCancelled(uint256 indexed tokenId, address indexed owner, string message);
    event AuctionFinalized(uint256 indexed tokenId, address indexed highestBidder, uint256 indexed highestBid, string message);

    struct Auction {
        uint256 startTime;
        uint256 endTime;
        uint256 startingBid;
        address highestBidder;
        uint256 highestBid;
    }

    constructor (address _nftAddress) {
        nftAddress = _nftAddress;
    }

    modifier onlyNftOwner(uint256 _tokenId) {
        address owner =  IERC721(nftAddress).ownerOf(_tokenId);
        require(
           owner == msg.sender, "Must be NFT owner"
        );
        _;
    }

    function list (uint256 _tokenId, uint256 _price) public onlyNftOwner(_tokenId){
        purchasePrice[_tokenId] = _price;
        isListed[_tokenId] = true;
    }

    function auction (uint256 _tokenId, uint256 _startTime, uint256 _endTime, uint256 _startingBid) public onlyNftOwner(_tokenId) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        auctions[_tokenId] = Auction({
            startTime: _startTime,
            endTime: _endTime,
            startingBid: _startingBid,
            highestBidder: address(0),
            highestBid: 0
        });
        isAuctioned[_tokenId] = true;
        emit NewAuctionStarted(msg.sender, _tokenId, auctions[_tokenId].startingBid, "A new auction has begun");
    }

    function getHighestBid(uint256 _tokenId) public view returns (uint256) {
        return auctions[_tokenId].highestBid;
    }

    function getHighestBidder(uint256 _tokenId) public view returns (address) {
        return auctions[_tokenId].highestBidder;
    }

    function bid (uint256 _tokenId) public payable {
        Auction storage auctionData = auctions[_tokenId];
        require(block.timestamp < auctionData.endTime, "Auction already ended");
        require(msg.value > auctionData.highestBid, "Your bid must be higher than the current highest bid");

        if(auctionData.highestBid > 0){
            (bool success, ) = payable(auctionData.highestBidder).call{value: auctionData.highestBid}("");
            require(success, "Ether transfer to bidder failed");
            emit BidRefunded(auctionData.highestBidder, _tokenId, auctionData.highestBid, "Bid refunded because there's an higher bid");
        }
        
        auctionData.highestBid = msg.value;
        auctionData.highestBidder = msg.sender;

        emit NewBidPlaced(auctionData.highestBidder, _tokenId, auctionData.highestBid, "A new bid has been placed");
    }

    function cancelAuction(uint256 _tokenId) public onlyNftOwner(_tokenId) {
        Auction storage auctionData = auctions[_tokenId];
        require(block.timestamp < auctionData.endTime, "Auction already ended");
        require(auctionData.highestBid == 0, "Cannot cancel after bidding starts");
        
        isAuctioned[_tokenId] = false;
        delete auctions[_tokenId];

        emit AuctionCancelled(_tokenId, msg.sender, "An auction has been cancelled");
    }

    function finalizeAuction (uint256 _tokenId) public onlyNftOwner(_tokenId){
        Auction storage auctionData = auctions[_tokenId];
        require(block.timestamp >= auctionData.endTime, "Auction is yet to end");

        if(auctionData.highestBid == 0) {
            isAuctioned[_tokenId] = false;
            emit AuctionFinalized(_tokenId, auctionData.highestBidder, auctionData.highestBid, "Auction has been finalized");
            delete auctions[_tokenId];
            return;
        }

        address seller = IERC721(nftAddress).ownerOf(_tokenId);

        IERC721(nftAddress).transferFrom(seller, auctionData.highestBidder, _tokenId);

        (bool success,) = payable(seller).call{value: auctionData.highestBid}("");
        require(success, "Ether transfer to seller failed");

        isAuctioned[_tokenId] = false;
        emit AuctionFinalized(_tokenId, auctionData.highestBidder, auctionData.highestBid, "Auction has been finalized");
        delete auctions[_tokenId];
    }


    function buy(uint256 tokenId) public payable {
        // Ensure the NFT has been listed
        require(isListed[tokenId], "NFT not listed for sale");

        // Ensure the buyer sends enough funds
        require(msg.value >= purchasePrice[tokenId], "Insufficient funds");

        // Transfer the NFT from the seller to the buyer
        address seller = IERC721(nftAddress).ownerOf(tokenId);
        IERC721(nftAddress).transferFrom(seller, msg.sender, tokenId);

        
        // Send the purchase price to the seller
        (bool success, ) = payable(seller).call{value: purchasePrice[tokenId]}("");
        require(success, "Ether transfer to seller failed");

        // Refund any excess funds to the buyer
        uint256 excessAmount = msg.value - purchasePrice[tokenId];
        if (excessAmount > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excessAmount}("");
            require(refundSuccess, "Refund to buyer failed");
        }

        // Update the listing status
        isListed[tokenId] = false;
    }

    function cancelSale (uint256 _tokenId) public onlyNftOwner(_tokenId){
        isListed[_tokenId] = false;
    }
}