import React, { useState, useEffect } from "react";
import { readContract } from "thirdweb";
import { contract } from "@/utils/contract";
import { useActiveAccount } from "@/app/thirdweb";

export default function Inventory() {
    const account = useActiveAccount();
    const [tokenIds, setTokenIds] = useState([]);
    // New state to hold product details
    const [productDetails, setProductDetails] = useState([]);

    useEffect(() => {
        const fetchTokenIDs = async () => {
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
                setTokenIds(Array.from(ids));

                // Map through tokenIds to fetch product details
                const productsPromises = Array.from(ids).map(id => 
                    readContract({
                        contract,
                        method: "getProductDetails", // Replace with your actual method name
                        params: [id],
                    })
                );
                const products = await Promise.all(productsPromises);
                setProductDetails(products);

            } catch (error) {
                console.error("Error fetching token IDs:", error);
            }
        };

        fetchTokenIDs();
    }, [account]);

    return (
        <div className="flex h-screen">
            <div className="flex flex-col">
                <h2>Product Details</h2>
                <ul>
                    {productDetails.map((product, index) => (
                        <li key={index}>
                          Token ID: {product.tokenId.toString()}, 
                          Name: {product.name}, 
                          Quantity: {product.quantity.toString()}, 
                          Price: {product.price.toString()},
                          Owner: {product.owner},
                          Current Owner: {product.currentOwner}
                        </li> // Adjust according to actual product structure
                    ))}
                </ul>
            </div>
        </div>
    );
}