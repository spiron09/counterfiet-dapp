import Link from "next/link";
import ConnectWallet from './ConnectWallet';
import { Button } from "@/components/ui/button";

export default function NavBar() {
  return (
    <div>
      <header className="flex h-20 w-full items-center justify-center px-4">
        <nav className="flex w-full max-w-6xl justify-between items-center px-2">
          <Button variant="link" className="h-12 text-lg font-medium px-0" asChild>
            <Link href="/">Home</Link>
          </Button>
          <div className="flex items-center justify-center gap-8 md:gap-8">
            <Button variant="link" className="h-12 text-lg font-medium px-0" asChild>
              <Link href="/inventory">Inventory</Link>
            </Button>
            <Button variant="link" className="h-12 text-lg font-medium px-0" asChild>
              <Link href="/create">Create Product</Link>
            </Button>
            <Button variant="link" className="h-12 text-lg font-medium px-0" asChild>
              <Link href="/transfer">Transfer</Link>
            </Button>
          </div>
          <ConnectWallet />
        </nav>
      </header>
    </div>
  );
}