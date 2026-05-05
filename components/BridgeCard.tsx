"use client";

import { useEffect, useState } from "react";
import { kit } from "@/lib/arc";
import { createAdapter } from "@/lib/adapter";
import ChainSelector from "./ChainSelector";
import AmountInput from "./AmountInput";
import type { Step } from "./ProgressSteps";
import ProgressSteps from "./ProgressSteps";
import type { AdapterContext } from "@circle-fin/app-kit";

type BridgeChainIdentifier = AdapterContext<any, any>["chain"];

export default function BridgeCard() {
  const [adapter, setAdapter] = useState<any>(null);

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const [fromChain, setFromChain] =
    useState<BridgeChainIdentifier>("Ethereum_Sepolia");

  const [toChain, setToChain] =
    useState<BridgeChainIdentifier>("Arc_Testnet");

  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  // Estimate fees (unchanged)
  const handleEstimate = async () => {
    if (!amount || !adapter) return;

    const estimate = await kit.estimateBridge({
      from: { adapter, chain: fromChain },
      to: {
        adapter,
        chain: toChain,
        useForwarder: true,
      },
      amount,
      token: "USDC",
    });

    setFees(estimate);
  };

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
        }))
      );
    } catch (err) {
      console.error("Bridge error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0f0f] p-6 rounded-2xl w-full max-w-md mx-auto shadow-xl border border-gray-800 space-y-4">
      <h2 className="text-xl font-semibold text-white">Bridge USDC</h2>

      <ChainSelector label="From" value={fromChain} onChange={setFromChain} />
      <ChainSelector label="To" value={toChain} onChange={setToChain} />

      <AmountInput amount={amount} setAmount={setAmount} />

      <input
        placeholder="Recipient (optional)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="w-full p-3 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white"
      />

      {fees && (
        <div className="text-sm text-gray-400">
          Fee: {fees.fee ?? "N/A"}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleEstimate}
          disabled={!adapter}
          className="flex-1 bg-gray-800 p-3 rounded-xl text-white"
        >
          Estimate
        </button>

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