"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation";
import { contract } from "@/utils/contract"
import { readContract } from "thirdweb";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AspectRatio } from "@/components/ui/aspect-ratio"
export default function ProductPage({ params }: { params: any }) {
  const [ownerData, setOwnerData] = useState({});
  const searchParams = useSearchParams();
  const encodedData = searchParams.get("data");
  const decodedData = JSON.parse(decodeURIComponent(encodedData as string));
  const imageU = decodedData.imageUrl;

  useEffect(() => {
    decodedData.IDs.forEach(async (id: any) => {
      const data = await getOwners(id);
      setOwnerData((prevData) => ({
        ...prevData,
        [id]: data,
      }));
    });
  }, [decodedData]);

  async function getOwners(id: bigint) {
    const data = await readContract({
      contract,
      method: "getProductDetails",
      params: [id],
    });

    return {
      owner: data.owner,
      currentOwner: data.currentOwner,
    };
  }
  return (
    <div className="flex justify-center mt-24">
      <Card className="flex justify-center w-3/5 h-[600px]">
        <div className="flex justify-between">
          <div className="w-[600px] h-[600px] my-auto mx-10 relative content-center">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={imageU} // Your image source
                alt={params.productName} // Description of the image
                layout="fill"// Height of the image
                objectFit="cover" // Corresponds to your "object-fit: cover"
                className="absolute m-0 rounded-md" // TailwindCSS classes for styling
              // Note: aspectRatio is not directly supported by Next.js Image component
              />
            </AspectRatio>
          </div>
          <div className="flex flex-col w-3/6 mx-10 my-12">
            <CardTitle className="font-black text-5xl">
              <div className="w-max">{decodedData.name}</div>
            </CardTitle>
            <CardContent className="p-0">
            <Separator className="mt-14"/>
              <div className="mt-14 grid grid-rows-4 gap-10 ">
                <div className="text-2xl font-bold text-muted-foreground">Price: {decodedData.price.toString()}</div>
                <div className="text-2xl font-bold text-muted-foreground">Total supply: {decodedData.quantity.toString()}</div>
                <div className="text-2xl font-bold text-muted-foreground">Tokens You Own: {decodedData.IDs.length.toString()}</div>
                <div className="text-2xl font-bold text-card-foreground italic">Token IDs: [{decodedData.IDs.map((id: string | number) => (
                    <HoverCard key={id.toString()}>
                      <HoverCardTrigger><Button className="text-2xl font-bold text-card-foreground italic" variant="link">{id.toString()}</Button></HoverCardTrigger>
                      <HoverCardContent className="w-fit">
                        <div className="text-lg font-medium text-card-foreground ">Owner: {ownerData[id]?.owner || 'Loading...'}</div>
                        <div className="text-lg font-medium text-card-foreground">Current Owner: {ownerData[id]?.currentOwner || 'Loading...'}</div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}]</div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}
