const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NftMarketplace", function () {
    let nftMarketplace;
    let owner;
    let addr1;
    let addrs;

    beforeEach(async function () {
        const NftMarketplaceFactory = await ethers.getContractFactory("NftMarketplace");
        nftMarketplace = await NftMarketplaceFactory.deploy();
        await nftMarketplace.deployed;

        [owner, addr1, ...addrs] = await ethers.getSigners();
    });

    it("Should create new products", async function () {

        const productName = "test product";
        const productPrice = 100;
        const productQuantity = 5;
        const productTokenUri = "https://bafybeigpieow4nfocxcl2bmvj3cnwrr3sntzyj73g4q4zyiyuzaompqaji.ipfs.dweb.link";


        await nftMarketplace.createProduct(
            productName,
            productPrice,
            productQuantity,
            productTokenUri
        );

        for (let i = 0; i < productQuantity; i++) {
            const product = await nftMarketplace.getProductDetails(i);
            expect(product.name).to.equal(productName);
            expect(product.price).to.equal(productPrice);
            expect(product.quantity).to.equal(productQuantity);
            expect(product.owner).to.equal(owner.address);
            expect(product.currentOwner).to.equal(owner.address);
        }

        const productIds = await nftMarketplace.getProductIds(productName);
        expect(productIds.length).to.equal(productQuantity);
        for (let i = 0; i < productQuantity; i++) {
            expect(productIds[i]).to.equal(i);
        }

    })

    it("Should transfer product", async function () {
        const productName = "TestProduct";
        const productPrice = 100;
        const productQuantity = 1;
        const productTokenUri = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

        await nftMarketplace.createProduct(
            productName,
            productPrice,
            productQuantity,
            productTokenUri
        );

        const productIds = await nftMarketplace.getProductIds(productName);
        await nftMarketplace.transferProduct(addr1.address, productIds[0]);
        const product = await nftMarketplace.getProductDetails(productIds[0]);
        expect(product.currentOwner).to.equal(addr1.address);
    });

    it("Should only allow the owner to transfer a product", async function () {
        const productName = "TestProduct";
        const productPrice = 100;
        const productQuantity = 1;
        const productTokenUri = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

        await nftMarketplace.createProduct(
            productName,
            productPrice,
            productQuantity,
            productTokenUri
        );

        const productIds = await nftMarketplace.getProductIds(productName);
        const product = await nftMarketplace.getProductDetails(productIds[0]);
        expect(product.currentOwner).to.equal(owner.address);

        // Attempt to transfer the product from an account that is not the owner
        await expect(nftMarketplace.connect(addr1).transferProduct(addr1.address, productIds[0])).to.be.revertedWith("Only the owner can transfer the product");

    
    });

    it("Should update the owner's product list after a transfer", async function () {
        const productName = "TestProduct";
        const productPrice = 100;
        const productQuantity = 1;
        const productTokenUri = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
        
        await nftMarketplace.createProduct(
            productName,
            productPrice,
            productQuantity,
            productTokenUri
        );
    
        const productIds = await nftMarketplace.getProductIds(productName);
        await nftMarketplace.transferProduct(addr1.address, productIds[0]);
    
        const ownerProductIds = await nftMarketplace.getProductIdsByOwner(owner.address);
        const newOwnerProductIds = await nftMarketplace.getProductIdsByOwner(addr1.address);
    
        expect(ownerProductIds).to.not.include(productIds[0]);
        expect(newOwnerProductIds).to.include(productIds[0]);
    });

});



//ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json

