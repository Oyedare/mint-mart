// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MintableNFT is ERC721URIStorage{
    uint256 private _tokenIds;

    constructor() ERC721("MintableNFT", "MNFT") {}

    function mint (string memory tokenURI) public returns(uint256) {
        uint256 newTokenId = _tokenIds + 1;
        _tokenIds++;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }

    function getTotalNFTSupply() public view returns(uint256) {
        return _tokenIds;
    }   

}