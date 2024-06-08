// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract UpdatedContract is ERC721URIStorage, Ownable {

    event ProductCreated(
        string name,
        uint256[] ids,
        uint256 quantity
    );

    uint256 private s_tokenCounter;
    address payable _owner;

    struct Product {
        uint256 tokenId;
        string name;
        uint256 price;
        uint256 quantity;
        address payable owner;
        address payable currentOwner;
    }

    mapping (uint256 =>  Product) private idToProduct;
    mapping (string =>  uint256[]) private productToIds;
    mapping (address => uint256[]) private ownerToIds;

    constructor() Ownable(msg.sender) ERC721("NftMarketplace", "NFTM") {
        s_tokenCounter = 0;
       _owner = payable(Ownable.owner());
    }

    function createProduct(string memory _name, uint256 _price, uint256 _quantity, string memory tokenUri) public onlyOwner {

        for(uint256 i = 0; i < _quantity; i++) {
            Product memory newProduct = Product(s_tokenCounter, _name, _price, _quantity, _owner, _owner);

            idToProduct[s_tokenCounter] = newProduct;
            productToIds[_name].push(s_tokenCounter);
            ownerToIds[_owner].push(s_tokenCounter);

            _setTokenURI(s_tokenCounter, tokenUri);
            _safeMint(payable(Ownable.owner()), s_tokenCounter);
            
            s_tokenCounter++;
        }

        emit ProductCreated(_name, productToIds[_name], _quantity);
    }

    function getProductDetails(uint256 tokenId) public view returns (Product memory) {
        Product memory product = idToProduct[tokenId];
        return product;
    }

    function getProductIds(string memory _name) public view returns (uint256[] memory) {
        return productToIds[_name];
    }

    function getProductIdsByOwner(address owner) public view returns (uint256[] memory) {
        return ownerToIds[owner];
    }
    
    function getOwner() public view returns (address) {
        return _owner;
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public override(IERC721, ERC721) {
        super.transferFrom(from, to, tokenId);
        _updateOwnership(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override(ERC721, IERC721) {
        super.safeTransferFrom(from, to, tokenId, _data);
        _updateOwnership(from, to, tokenId);
    }
    
    function _updateOwnership(address from, address to, uint256 tokenId) internal {
        Product storage product = idToProduct[tokenId];
        product.currentOwner = payable(to);

        // Add the tokenId to the new owner
        ownerToIds[to].push(tokenId);

        // Remove the tokenId from the previous owner's mapping
        uint256 length = ownerToIds[from].length;
        for (uint256 i = 0; i < length; i++) {
            if (ownerToIds[from][i] == tokenId) {
                ownerToIds[from][i] = ownerToIds[from][length - 1];
                ownerToIds[from].pop();
                break;
            }
        }
    }

    function successDeploy() public pure returns (string memory){
        return "Contract deployed successfully!";
    }

}