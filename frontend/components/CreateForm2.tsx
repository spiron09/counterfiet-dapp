"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { contract } from "@/utils/contract";
import { useActiveAccount, useSendTransaction } from "@/app/thirdweb";

import { wallet } from "@/app/wallet";
const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Product Name must be at least 2 characters.",
    }),
    description: z.string().min(1, {
        message: "Description must be at least 1 character."
    }),
    quantity: z.coerce.number().min(1, {
        message: "Quantity must be at least 1.",
    }),
    price: z.coerce.number().min(1, {
        message: "Price must be at least 1.",
    }),
    image: z.any(),
});

export default function CreateForm() {
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileURL, setFileURL] = useState<string>("");
    const [tokenURI, setTokenURI] = useState<string>("");
    const { toast } = useToast();
    // const { mutate: sendAndConfirmTx, data: transactionReceipt } = useSendAndConfirmTransaction();
    const account = useActiveAccount();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            quantity: 1,
            price: 1,
        },
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        try {
            if (file) {
                setIsUploading(true);
            }
            // Api call to upload image to IPFS and get the URL
            const formData = new FormData();
            if (file) {
                formData.append("file", file);
            }
            axios({
                method: "POST",
                url: "/api/imageupload",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
                .then((response) => {
                    setFileURL(response.data.imageUrl);
                    console.log(fileURL);
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setIsUploading(false);
                });
        } catch (e) {
            console.log("Error in uploading image", e);
            toast({
                title: "Upload failed.",
                description: "There was a problem uploading your image.",
                variant: "destructive"
            });
        }
    }

    async function getTokenURI(
        data: z.infer<typeof formSchema>
    ): Promise<string> {
        try {
            // const formData = new FormData();
            // formData.append("name", data.name);
            // formData.append("description", data.description);
            // formData.append("image", fileURL.toString())
            // formData.append("attributes", );
            const metadata = {
                name: data.name,
                description: data.description,
                image: fileURL.toString(),
                attributes: [
                    {
                        trait_type: "Price",
                        value: data.price.toString(),
                    },
                    {
                        trait_type: "Quantity",
                        value: data.quantity.toString(),
                    }
                ]
            };

            const metadataJSON = JSON.stringify(metadata);

            const response = await axios({
                method: "POST",
                url: "/api/createnft",
                data: metadataJSON,
                headers: {
                    "Content-Type": "aplication/json",
                },
            });

            console.log(response.data);
            const tokenURI = response.data.tokenURI;

            if (!tokenURI) {
                throw new Error("Failed to fetch tokenURI");
            }

            return tokenURI; // Return the tokenURI
        } catch (e) {
            console.error("Error creating tokenURI", e);
            throw e; // Re-throw the error to be caught by the caller
        }
    }

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            // Wait for the tokenURI to be fetched
            const tokenUri = await getTokenURI(data);
            console.log("Creating NFTS......");
            const quantity: bigint = BigInt(data.quantity);
            const price: bigint = BigInt(data.price);
            console.log("New Token URI", tokenUri);
            const transaction = prepareContractCall({
                contract: contract,
                method: "createProduct",
                params: [data.name, price, quantity, tokenUri], // Use tokenUri directly
            });
            const transactionReceipt = await sendTransaction({
                account: account!,
                transaction,
            });
            console.log("Transaction Receipt", transactionReceipt);
            toast({
                title: "Success!",
                description: "Product successfully created.",
            });
        } catch (e) {
            console.error("Error creating NFT or in transaction", e);
            toast({
                title: "Creation failed.",
                description: "There was a problem creating your NFT.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function getTokenIDS() {
        const result = await readContract({
            contract,
            method: "getProductIdsByOwner",
            params: [account?.address],
        });
        console.log("Token IDS", result);

        // const transaction = prepareContractCall({
        //   contract: contract,
        //   method: "transferProduct",
        //   params: ["0xb7002DF992841476BC8588E8C0E65e3370dDEeC5",BigInt(1)],
        // });

        // const transactionReceipt = await sendTransaction({
        //   account: account,
        //   transaction,
        // });

        // const prod = await readContract({
        //   contract,
        //   method: "getProductDetails",
        //   params: [BigInt(1)]
        // });

        // console.log("Product Details", prod)
    }

    return (
        <div className="max-w-md mx-auto mt-10 space-y-6">
            <h1 className="text-4xl mb-14 font-bold">Create NFT</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter Product Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Enter Description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="Enter Quantity"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Enter Price" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel htmlFor="picture">Upload Image</FormLabel>
                                <FormControl>
                                    <Input
                                        id="picture"
                                        type="file"
                                        placeholder="Upload Image"
                                        {...field}
                                        onChange={handleChange}
                                    />
                                </FormControl>
                                <FormMessage>
                                    {isUploading && "Uploading image, please wait..."}
                                </FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button
                        className="w-full"
                        type="submit"
                        disabled={isUploading || isSubmitting}
                    >
                        Submit
                    </Button>

                    {isSubmitting && (
                        <div className="flex justify-center items-center">
                            <span className="text-m font-medium text-opacity-50">
                                Creating Products Please wait....
                            </span>
                        </div>
                    )}
                </form>
            </Form>
            {/* <Button className="w-full" onClick={getTokenIDS}>
                Get Token IDs
            </Button> */}
        </div>
    );
}
