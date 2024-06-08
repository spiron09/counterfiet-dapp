const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UpdatedContract", function() {
  let updatedContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function() {
    // Deploy the contract
    const UpdatedContract = await ethers.getContractFactory("UpdatedContract");
    updatedContract = await UpdatedContract.deploy();
    await updatedContract.deployed;

    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
  });

  it("Should create new products and maintain correct ownership", async function() {
    const productName = "test product";
    const productPrice = 100;
    const productQuantity = 5;
    const productTokenUri = "https://bafybeigpieow4nfocxcl2bmvj3cnwrr3sntzyj73g4q4zyiyuzaompqaji.ipfs.dweb.link";

    await updatedContract.createProduct(
      productName,
      productPrice,
      productQuantity,
      productTokenUri
    );

    // Assertions
    for (let i = 0; i < productQuantity; i++) {
      const product = await updatedContract.getProductDetails(i);
      expect(product.name).to.equal(productName);
      expect(product.price.toString()).to.equal(productPrice.toString());
      expect(product.quantity.toString()).to.equal(productQuantity.toString());
      expect(product.owner).to.equal(owner.address);
      expect(product.currentOwner).to.equal(owner.address);
    }
  });

  it("Should allow transfer of a product and update ownerships accordingly", async function() {
    const productName = "unique product";
    const productPrice = 100;
    const productQuantity = 1;
    const productTokenUri = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    await updatedContract.createProduct(
      productName,
      productPrice,
      productQuantity,
      productTokenUri
    );

    await updatedContract['safeTransferFrom(address,address,uint256)'](
      owner.address,
      addr1.address,
      0 // assuming 0 is the tokenId of the first (and only) product created above
    );

    const productAfterTransfer = await updatedContract.getProductDetails(0);
    expect(productAfterTransfer.currentOwner).to.equal(addr1.address);
  });

  it("Should fail to transfer a product by non-owner", async function () {
    const productName = "Another Unique Product";
    const productPrice = 200;  // Updated for consistency
    const productQuantity = 1;
    const productTokenUri = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    // Attempt to create a product as addr1, expected to fail
    await expect(updatedContract.connect(addr1).createProduct(
        productName,
        productPrice,
        productQuantity,
        productTokenUri
    )).to.be.revertedWith("Ownable: caller is not the owner");  // Ensuring the error matches your contract's logic

    // Owner creates a product successfully
    await updatedContract.createProduct(
        productName,
        productPrice,
        productQuantity,
        productTokenUri
    );

    // Attempt to transfer the product as addr1, expected to fail
    await expect(updatedContract.connect(addr1)['safeTransferFrom(address,address,uint256)'](
            owner.address,
            addr1.address,
            0
    )).to.be.revertedWith("ERC721: transfer caller is not owner nor approved"); // Confirm this error matches your ERC721 implementation
});

it("Should properly update ownership mapping after a transfer", async function () {
    const productName = "Test Transfer";
    const productPrice = 100;  // Updated for consistency
    const productQuantity = 1;
    const productTokenUri = "ipfs://producttokenuri";  // Simplified for clarity

    // Owner creates a product
    await updatedContract.createProduct(
        productName,
        productPrice,
        productQuantity,
        productTokenUri
    );

    // Await the transaction receipt of transferring the product to addr1
    const transferTx = await updatedContract.safeTransferFrom(owner.address, addr1.address, 0);
    await transferTx.wait(); // Ensure transaction is mined

    // Fetch and verify the current owner of the product is addr1
    const productAfterFirstTransfer = await updatedContract.getProductDetails(0);
    expect(productAfterFirstTransfer.currentOwner).to.equal(addr1.address);

    // Transfer the product from addr1 to addr2 and await the transaction receipt
    const transferTx2 = await updatedContract.connect(addr1).safeTransferFrom(addr1.address, addr2.address, 0);
    await transferTx2.wait(); // Ensure transaction is mined

    // Fetch and verify the new current owner is addr2
    const productAfterSecondTransfer = await updatedContract.getProductDetails(0);
    expect(productAfterSecondTransfer.currentOwner).to.equal(addr2.address);

    // Verifications on owner's product list updates
    const ownerProductIdsAfterTransfers = await updatedContract.getProductIdsByOwner(owner.address);
    expect(ownerProductIdsAfterTransfers).to.deep.include(ethers.BigNumber.from(0));
    const addr1ProductIdsAfterTransfers = await updatedContract.getProductIdsByOwner(addr1.address);
    expect(addr1ProductIdsAfterTransfers).to.not.deep.include(ethers.BigNumber.from(0));
    const addr2ProductIdsAfterTransfers = await updatedContract.getProductIdsByOwner(addr2.address);
    expect(addr2ProductIdsAfterTransfers).to.deep.include(ethers.BigNumber.from(0));
});

  // Implement additional test cases as needed to fully cover your contract's functionality.
});