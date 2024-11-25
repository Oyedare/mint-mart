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