"use client"
import CreateForm2 from "@/components/CreateForm2"
import { contract } from "@/utils/contract";
import { readContract } from 'thirdweb';
import { useActiveAccount } from "@/app/thirdweb";
import { useState, useEffect } from 'react';
export default function Transfer() {
    // const [activeView, setActiveView] = useState('Inventory');
    const [isOwner, setIsOwner] = useState(false); // State to track if the current user is the owner
    const account = useActiveAccount(); // Get the active account

    useEffect(() => {
        (async () => { // IIFE to run async code within useEffect
            const owner = await readContract({
                contract,
                method: "getOwner",
                params: [],
            });
            console.log(owner, "Owner");

            // Update state based on whether the current user is the owner
            if (account && account.address === owner) {
                setIsOwner(true);
            } else {
                setIsOwner(false);
            }
        })();
    }, [account]); // Rerun this effect when account changes
    return (
        <div>
            {isOwner ? (
                <CreateForm2 />
            ) : (
                <h1>You do not have access to this functionality</h1>
            )}
        </div>
    )
}