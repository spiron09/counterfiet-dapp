import Image from "next/image";
import { useRouter } from "next/navigation";
import { CardContent, Card } from "@/components/ui/card"

export default function SingleProduct({ product }) {
  const router = useRouter();

  function handleClick(product) {
    console.log(product, "product");
    let productClone = JSON.parse(JSON.stringify(product, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value // Convert BigInt to strings
    ));
    const productNameSlug = encodeURIComponent(product.name.toLowerCase().replace(/\s+/g, '-'));
    const encodedData = encodeURIComponent(JSON.stringify(productClone));
    router.push(`/products/${productNameSlug}?data=${encodedData}`); //
  }
  return (
    <Card className="w-72 h-96 rounded-lg overflow-hidden shadow-lg">
      <div className="cursor-pointer" onClick={() => handleClick(product)}>
        <div className="flex justify-center">
          <div className="w-56 h-56 my-7 relative"> {/* Fixed height container for the image */}
            <Image
              src={product.imageUrl.toString()}
              alt={product.name}
              layout="fill" // Change to fill to ensure it covers the div completely
              objectFit="cover" // Keeps the aspect ratio and covers the div area
              className="absolute m-0 rounded-md" // Make absolute within the relative container
            />
          </div>
        </div>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{product.name}</div>
          <div className="text-lg font-medium text-muted-foreground flex w-full align-items-center justify-between">
            <div className="">Quantity: {product.IDs.length}</div>
            <div className="">Price: {product.price.toString()}</div>
          </div>
        </CardContent>
        {/* <div className="pb-3">Price: {tokenID}</div> */}
      </div>
    </Card>
  );
}
