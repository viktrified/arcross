import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";

export async function createAdapter() {
  if (typeof window === "undefined") {
    throw new Error("Must run in browser");
  }

  const provider = (window as any).ethereum as EIP1193Provider;

  if (!provider) {
    throw new Error("No wallet found");
  }

  const adapter = await createViemAdapterFromProvider({
    provider,
  });

  return adapter;
}