// components/ChainSelector.tsx

"use client";

import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  chains?: { label: string; value: string }[];
  locked?: boolean;

  amount?: string;
  setAmount?: (val: string) => void;
};

const CHAINS = [
  { label: "Ethereum Sepolia", value: "Ethereum_Sepolia" },
  { label: "Base Sepolia", value: "Base_Sepolia" },
  { label: "Arc Testnet", value: "Arc_Testnet" },
];

export default function ChainSelector({
  label,
  value,
  onChange,
  chains,
  locked,
  amount,
  setAmount,
}: Props) {
  const ALL_CHAINS = chains ?? CHAINS;
  const selected =
    CHAINS.find((c) => c.value === value) ||
    ALL_CHAINS.find((c) => c.value === value);

  const [open, setOpen] = useState(false);
  return (
    <div className="relative w-full">
      <div className="relative bg-[#151515] border border-[#2a2a2a] rounded-[28px] px-5 py-4 min-h-[120px] overflow-hidden">
        {/* top row */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[13px] text-[#8b8b8b]">{label}</span>

            <div className="flex items-center gap-3 mt-3">
              {/* token icon */}
              <div className="w-11 h-11 rounded-full bg-[#1f1f1f] flex items-center justify-center border border-[#2d2d2d]">
                <div className="w-7 h-7 rounded-full bg-blue-500" />
              </div>

              <div className="flex flex-col">
                <span className="text-white font-medium text-[20px] leading-none">
                  USDC
                </span>

                <span className="text-[#7b7b7b] text-sm mt-1">
                  {selected?.label}
                </span>
              </div>
            </div>
          </div>

          {!locked && (
            <select
              value={value}
              onClick={() => setOpen((prev) => !prev)}
              onBlur={() => setOpen(false)}
              onChange={(e) => {
                onChange(e.target.value);
                setOpen(false);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              {ALL_CHAINS.map((chain) => (
                <option key={chain.value} value={chain.value}>
                  {chain.label}
                </option>
              ))}
            </select>
          )}

          <div className="w-10 h-10 rounded-full border border-[#2d2d2d] flex items-center justify-center">
            <HiChevronDown
              className={`text-[#8b8b8b] transition-transform duration-300 ${
                open ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </div>

        {/* amount section */}
        <div className="mt-6 flex items-start justify-between">
          {label === "From" ? (
            <input
              type="number"
              min="0"
              value={amount}
              onKeyDown={(e) => {
                if (["-", "+", "e", "E"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value;

                if (!setAmount) return;

                if (value === "") {
                  setAmount("");
                  return;
                }

                const num = parseFloat(value);
                setAmount(num < 0 ? "0" : value);
              }}
              placeholder="0.00"
              className="bg-transparent outline-none border-none text-[42px] leading-none font-semibold text-white placeholder:text-[#4a4a4a] w-[180px]"
            />
          ) : (
            <div className="text-[42px] leading-none font-semibold text-[#4a4a4a]">
              0.00
            </div>
          )}

          <div className="flex flex-col items-end">
            <button className="rounded-full bg-[#f3f3f3]/70 px-3 py-1 text-[12px] font-medium text-[#4a4a4a] transition hover:bg-[#e7e7e7]">
              Max
            </button>
            <div className="text-[12px] text-[#6d6d6d] mt-2">Balance: 0.00</div>
          </div>
        </div>
      </div>
    </div>
  );
}
