import { chain } from "@/app/chain"
import { client } from "@/app/client"
import { getContract } from "thirdweb"
import { contractABI } from "./contractABI_new"
//new contract
const contractAddress = "0xDd48c281F9Ee831dA6fe969248b608702AAEC50b"

// //old contract
// const contractAddress = "0x45D88F169B1C01c679F0dbF23206553EBefACCD8"
// const contractAddress = "0x5B28fB822daf5CE7290208a300B5452cc5Ec9919"

export const contract=getContract({
    client:client,
    chain: chain,
    address: contractAddress,
    abi: contractABI
})
