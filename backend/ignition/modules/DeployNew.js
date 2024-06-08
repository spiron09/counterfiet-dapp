const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("UpdatedContract", (m) => {
    const NftMp = m.contract("UpdatedContract", []);  
    const name = m.getParameter("name", "Test NFT");
    const price = m.getParameter("price", 100);
    const quantity = m.getParameter("quantity", 5);
    const tokenURI = m.getParameter("tokenURI", "ipfs://QmcHgh2hgKw753s8WykwXunEF9PvcLyiWwKbLNWB1sU8qP");

    // const nftMarketplace = m.call(NftMp,"createProduct", [name, price, quantity, tokenURI]);
    // const nftMarketplace = m.call(NftMp);

    return { NftMp };
});
