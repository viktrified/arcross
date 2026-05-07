"use client";

import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  chains?: { label: string; value: string }[];
  locked?: boolean;
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
        <div className="mt-6">
          <div className="text-[42px] leading-none font-semibold text-[#4a4a4a]">
            0.00
          </div>

          <div className="text-sm text-[#6d6d6d] mt-2">$0.00</div>
        </div>
      </div>
    </div>
  );
}


