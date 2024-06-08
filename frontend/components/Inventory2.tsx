"use client"
import React, { useState, useEffect } from "react";
import { ThirdwebContract, readContract } from "thirdweb";
import { contract } from "@/utils/contract";
import { useActiveAccount } from "@/app/thirdweb";
import SingleProduct from "./SingleProduct";
import { tokenURI } from "thirdweb/extensions/erc721";
import axios from "axios";

async function fetchMetadataUrl(contract: ThirdwebContract, tokenId: string | number | bigint | boolean) {
  const metadataUri = await tokenURI({
    tokenId: BigInt(tokenId),
    contract: contract,
  });
  return metadataUri;
}

async function fetchMetadata(metadataUri: string) {
  const response = await axios.get(metadataUri);
  const metadata = await response.data;
  return metadata;
}

export default function () {
  const account = useActiveAccount();
  const [productDetails, setProductDetails] = useState([]);

  useEffect(() => {
    const fetchTokenIDsAndDetails = async () => {
      if (!account || !account.address) {
        console.log("No account found");
        return;
      }
      try {
        const ids = await readContract({
          contract,
          method: "getProductIdsByOwner",
          params: [account.address],
        });

        console.log(ids, "Owner Token IDs");

        const productDetailsPromises = ids.map(async (id) => {
          const productBasicDetails = await readContract({
            contract,
            method: "getProductDetails",
            params: [id],
          });

          console.log(productDetailsPromises, "Product Details Promises")
          const metadataUri = await fetchMetadataUrl(contract, id);
          const metaUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadataUri.toString().slice(7)}`;
          const metadata = await fetchMetadata(metaUrl);

          return {
            ...productBasicDetails,
            id,
            imageUrl: `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${metadata.image.toString().slice(7)}`,
          };
        });

        let detailsRaw = await Promise.all(productDetailsPromises);
        console.log(detailsRaw, "Raw details");
        // Filter for unique product names
        let uniqueDetailsByName: { [key: string]: any } = {};
        detailsRaw.forEach(detail => {
          // Assuming 'name' is the property you're using to determine uniqueness
          uniqueDetailsByName[detail.name] = detail;
        });
        console.log(uniqueDetailsByName, "Unique details by name");
        for (const [prod_name, prod_obj] of Object.entries(uniqueDetailsByName)) {
          const prod_ids = await readContract({
            contract,
            method: "getProductIds",
            params: [prod_name],
          })
          const filtered_prod_ids = prod_ids.filter(id => ids.includes(id));
          uniqueDetailsByName[prod_name]["IDs"] = filtered_prod_ids
        }

        let uniqueDetails: any[] = Object.values(uniqueDetailsByName);
        console.log(uniqueDetails, "Unique details by name with IDs");

        setProductDetails(uniqueDetails as never[]);
      } catch (error) {
        console.error("Error fetching token IDs:", error);
      }
    };

    if (account && account.address) {
      fetchTokenIDsAndDetails();
    }
  }, [account]);

  return (
    <div className="flex w-full justify-center">
      <div className="min-w-12xl">
        <div className="flex mb-20 mt-10">
          <h1 className="text-4xl font-bold">Products</h1>
        </div>
        <div>
          <div className="grid grid-cols-3 gap-24 auto-rows max-w-6xl">
            {productDetails.map((product: { name: string }, index) => (
              <SingleProduct
                key={product.name}
                product={product}
              />
            ))}
            {/* Add more <SingleProduct/> components as needed */}
          </div>
        </div>
      </div>
    </div>

  );
}
