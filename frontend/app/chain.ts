import { defineChain } from "thirdweb";

export const chain = defineChain({
    id: 1337,
    rpc: process.env.NEXT_PUBLIC_LOCAL_RPC_URL as string,
});

// export const chain = defineChain({
//     id: 11155111,
//     rpc: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL as string,
// });
// export const chain = defineChain(11155111);