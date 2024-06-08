import { ConnectButton, ThirdwebProvider } from "@/app/thirdweb";
import {client} from "@/app/client"
import {chain} from "@/app/chain"

export default function ConnectWallet() {
  return (
      <div>
      <ThirdwebProvider>
        <ConnectButton
          chain={chain}
          client={client}
          theme={"light"}
          connectModal={{
            size: "compact",
            showThirdwebBranding: false,
          }}
        />
      </ThirdwebProvider>
      </div>
  );
}
