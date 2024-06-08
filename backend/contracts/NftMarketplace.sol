// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftMarketplace is ERC721URIStorage, Ownable {

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
    
    function transferProduct(address newOwner, uint256 productId) public returns(address){
        require(msg.sender == idToProduct[productId].owner, "Only the owner can transfer the product");
        Product storage product = idToProduct[productId];
        product.currentOwner = payable(newOwner);
        ownerToIds[newOwner].push(productId);
        //remove the product from the previous owner
        uint256[] storage ids = ownerToIds[msg.sender];
        for(uint256 i = 0; i < ids.length; i++) {
            if(ids[i] == productId) {
                ids[i] = ids[ids.length - 1];
                ids.pop();
                break;
            }
        }
        _transfer(product.owner, newOwner, productId);
        
        return product.currentOwner;       
    }
    

    function successDeploy() public pure returns (string memory){
        return "Contract deployed successfully!";
    }

}