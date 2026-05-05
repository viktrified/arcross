import { createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { createViemAdapter } from "@circle-fin/adapter-viem-v2";

export const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(),
});

export const adapter = createViemAdapter({
  client: walletClient,
});