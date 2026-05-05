"use client";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
};

const CHAINS = [
  { label: "Ethereum Sepolia", value: "Ethereum_Sepolia" },
  { label: "Base Sepolia", value: "Base_Sepolia" },
  { label: "Arc Testnet", value: "Arc_Testnet" },
];

export default function ChainSelector({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1a1a1a] text-white p-3 rounded-xl border border-gray-700"
      >
        {CHAINS.map((chain) => (
          <option key={chain.value} value={chain.value}>
            {chain.label}
          </option>
        ))}
      </select>
    </div>
  );
}