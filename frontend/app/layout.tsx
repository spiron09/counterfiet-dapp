import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThirdwebProvider } from "@/app/thirdweb";
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { Toaster } from "@/components/ui/toaster"
import NavBar from "@/components/NavBar"
const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>
          <div>
            <NavBar />
            <main>
              {children}
            </main>
          </div>
        </ThirdwebProvider>
        <Toaster />
      </body>
    </html>
  );
}
