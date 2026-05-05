"use client";

import { useEffect, useState } from "react";
import { kit } from "@/lib/arc";
import { adapter } from "@/lib/adapter";

import ChainSelector from "./ChainSelector";
import AmountInput from "./AmountInput";
import ProgressSteps from "./ProgressSteps";

export default function BridgeCard() {
  const [fromChain, setFromChain] = useState("Ethereum_Sepolia");
  const [toChain, setToChain] = useState("Arc_Testnet");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const [steps, setSteps] = useState([
    { name: "Approve", status: "idle" },
    { name: "Burn", status: "idle" },
    { name: "Attestation", status: "idle" },
    { name: "Mint", status: "idle" },
  ]);

  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Listen to bridge events
  useEffect(() => {
    kit.on("*", (event: any) => {
      const map: any = {
        "bridge.approve": 0,
        "bridge.burn": 1,
        "bridge.attestation": 2,
        "bridge.mint": 3,
      };

      const index = map[event.method];
      if (index !== undefined) {
        setSteps((prev) => {
          const updated = [...prev];
          updated[index].status = "done";
          return updated;
        });
      }
    });
  }, []);

  // 💰 Estimate fees
  const handleEstimate = async () => {
    if (!amount) return;

    const estimate = await kit.estimateBridge({
      from: { adapter, chain: fromChain },
      to: {
        chain: toChain,
        recipientAddress: recipient || undefined,
        useForwarder: true,
      },
      amount,
      token: "USDC",
    });

    setFees(estimate);
  };

  // 🚀 Execute bridge
  const handleBridge = async () => {
    try {
      setLoading(true);

      const result = await kit.bridge({
        from: { adapter, chain: fromChain },
        to: {
          chain: toChain,
          recipientAddress: recipient || undefined,
          useForwarder: true,
        },
        amount,
        token: "USDC",
      });

      if (result.state === "error") {
        await kit.retry(result, {
          from: adapter,
          to: adapter,
        });
      }
    } catch (err) {
      console.error(err);
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

      {/* Fees */}
      {fees && (
        <div className="text-sm text-gray-400">
          Fee: {fees.fee ?? "N/A"}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleEstimate}
          className="flex-1 bg-gray-800 p-3 rounded-xl text-white"
        >
          Estimate
        </button>

        <button
          onClick={handleBridge}
          disabled={!amount || loading}
          className="flex-1 bg-blue-600 p-3 rounded-xl text-white disabled:opacity-50"
        >
          {loading ? "Bridging..." : "Bridge"}
        </button>
      </div>

      <ProgressSteps steps={steps} />
    </div>
  );
}