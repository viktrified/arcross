// components/BridgeCard.tsx

"use client";

import { useEffect, useState } from "react";
import { kit } from "@/lib/arc";
import { createAdapter } from "@/lib/adapter";
import ChainSelector from "./ChainSelector";
import AmountInput from "./AmountInput";
import type { Step } from "./ProgressSteps";
import ProgressSteps from "./ProgressSteps";
import type { AdapterContext } from "@circle-fin/app-kit";
import { HiArrowsUpDown } from "react-icons/hi2";

type BridgeChainIdentifier = AdapterContext<any, any>["chain"];

const ARC = "Arc_Testnet";
const NON_ARC_CHAINS = [
  { label: "Ethereum Sepolia", value: "Ethereum_Sepolia" },
  { label: "Base Sepolia", value: "Base_Sepolia" },
];

export default function BridgeCard() {
  const [adapter, setAdapter] = useState<any>(null);

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const [fromChain, setFromChain] = useState<BridgeChainIdentifier>(ARC);
  const [toChain, setToChain] =
    useState<BridgeChainIdentifier>("Ethereum_Sepolia");

  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [swapped, setSwapped] = useState(false);
  const [showCustomAddress, setShowCustomAddress] = useState(false);

  const [steps, setSteps] = useState<Step[]>([
    { name: "Approve", status: "idle" },
    { name: "Burn", status: "idle" },
    { name: "Attestation", status: "idle" },
    { name: "Mint", status: "idle" },
  ]);

  // Initialize adapter
  useEffect(() => {
    const init = async () => {
      const ad = await createAdapter();
      setAdapter(ad);
    };

    init();
  }, []);

  // PROGRESS EVENT LISTENER (FIXED)
  useEffect(() => {
    if (!kit) return;

    const map: Record<string, number> = {
      "bridge.approve": 0,
      "bridge.burn": 1,
      "bridge.attestation": 2,
      "bridge.mint": 3,
    };

    const handler = (event: any) => {
      const index = map[event.method];
      if (index === undefined) return;

      setSteps((prev) => {
        const updated = [...prev];

        // mark ACTIVE step (loading)
        updated[index] = {
          ...updated[index],
          status: "loading",
        };

        return updated;
      });
    };

    kit.on("*", handler);

    return () => {
      kit.off?.("*", handler);
    };
  }, []);

  const handleSwap = () => {
    if (fromChain === ARC) {
      setFromChain(toChain);
      setToChain(ARC);
    } else {
      setToChain(fromChain);
      setFromChain(ARC);
    }

    setSwapped((prev) => !prev);
  };

  // Estimate fees (unchanged)
  // const handleEstimate = async () => {
  //   if (!amount || !adapter) return;

  //   const estimate = await kit.estimateBridge({
  //     from: { adapter, chain: fromChain },
  //     to: {
  //       adapter,
  //       chain: toChain,
  //       useForwarder: true,
  //     },
  //     amount,
  //     token: "USDC",
  //   });

  //   setFees(estimate);
  // };

  // Bridge (ONLY progress touched here)
  const handleBridge = async () => {
    if (!amount || !adapter) return;

    try {
      setLoading(true);

      // RESET STEPS (safe + clean)
      setSteps([
        { name: "Approve", status: "loading" },
        { name: "Burn", status: "idle" },
        { name: "Attestation", status: "idle" },
        { name: "Mint", status: "idle" },
      ]);

      const result = await kit.bridge({
        from: { adapter, chain: fromChain },
        to: { adapter, chain: toChain, useForwarder: true },
        amount,
        token: "USDC",
      });

      console.log("Bridge result:", result);

      // no kit.retry exists → keep re-call fallback
      if (result.state === "error") {
        const retryResult = await kit.bridge({
          from: { adapter, chain: fromChain },
          to: { adapter, chain: toChain, useForwarder: true },
          amount,
          token: "USDC",
        });

        console.log("Retry result:", retryResult);
      }

      // FINAL STEP UPDATE (ALL DONE)
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: "done",
        })),
      );
    } catch (err) {
      console.error("Bridge error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="relative flex flex-col gap-3">
        <ChainSelector
          label="From"
          value={fromChain}
          onChange={setFromChain}
          chains={NON_ARC_CHAINS}
          locked={fromChain === ARC}
          amount={amount}
          setAmount={setAmount}
        />
        <button
          onClick={handleSwap}
          className="absolute left-1/2 top-[50%] z-20 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#151515] border border-[#2a2a2a] flex items-center justify-center"
        >
          <HiArrowsUpDown
            className={`text-white text-xl transition-transform duration-300 ${
              swapped ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        <ChainSelector
          label="To"
          value={toChain}
          onChange={setToChain}
          chains={NON_ARC_CHAINS}
          locked={toChain === ARC}
        />
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Custom Address</span>
          <button
            onClick={() => setShowCustomAddress((prev) => !prev)}
            className={`w-11 h-6 rounded-full transition-colors duration-200 ${
              showCustomAddress ? "bg-blue-600" : "bg-gray-700"
            } relative`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                showCustomAddress ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {showCustomAddress && (
          <input
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="mt-3 w-full bg-transparent border-t border-gray-700 pt-3 text-white text-sm outline-none placeholder-gray-600"
          />
        )}
      </div>

      {/* {fees?.fees?.length > 0 && (
        <div className="space-y-1 text-sm text-gray-400">
          {fees.fees.map((fee: any, index: number) => (
            <div key={index}>
              {fee.type}: {fee.amount}
            </div>
          ))}
        </div>
      )} */}

      <div className="flex gap-2">
        {/* <button
          onClick={handleEstimate}
          disabled={!adapter || loading || !amount || Number(amount) <= 0}
          className="flex-1 bg-gray-800 p-3 rounded-xl text-white"
        >
          Estimate
        </button> */}

        <button
          onClick={handleBridge}
          disabled={!amount || loading || !adapter}
          className="flex-1 bg-blue-600 p-3 rounded-xl text-white disabled:opacity-50"
        >
          {loading ? "Bridging..." : "Bridge"}
        </button>
      </div>

      <ProgressSteps steps={steps} />
    </div>
  );
}
