"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { prepareContractCall, sendTransaction, readContract, Address } from "thirdweb";
import { contract } from "@/utils/contract";
import { transferFrom } from "thirdweb/extensions/erc721";
import { isAddress } from 'thirdweb/utils'
import { useActiveAccount } from "@/app/thirdweb";
import { useToast } from "@/components/ui/use-toast";
const formSchema = z.object({
  address: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  tokenId: z.coerce.number().min(0, {
    message: "Token ID must be at least 0."
  })
});

export default function Transfer() {
  const { toast } = useToast();
  const account = useActiveAccount();
  // ...
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      tokenId: 0,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const a = values.address;
      const tokenID = BigInt(values.tokenId);
      // Do something with the form values.
      // ✅ This will be type-safe and validated.
      const transaction = transferFrom({
        contract,
        from: account.address,
        to: a,
        tokenId: tokenID
      });

      const transactionReceipt = await sendTransaction({
        account: account,
        transaction,
      });
      console.log(transactionReceipt);
      toast({
        title: "Transfer Succesfull.",
        description: "Product has been transfered successfully",
      });

    }
    catch (e) {
      console.error("Error while transfering product", e);
      toast({
        title: "Transfer failed.",
        description: "Error while transfering product.",
        variant: "destructive"
      });
    }
  }
  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <h1 className="text-4xl mb-14 font-bold">Transfer Product</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipent's Wallet Address</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Enter Recipent's Wallet Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tokenId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Token ID</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter the Token ID of the NFT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">Transfer</Button>
        </form>
      </Form>
    </div>
  );
}
