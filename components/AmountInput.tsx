// components/AmountInput.tsx

"use client";

type Props = {
  amount: string;
  setAmount: (val: string) => void;
};

export default function AmountInput({ amount, setAmount }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-400">Amount (USDC)</label>
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

          if (value === "") {
            setAmount("");
            return;
          }

          const num = parseFloat(value);
          setAmount(num < 0 ? "0" : value);
        }}
        placeholder="0.00"
        className="bg-[#1a1a1a] text-white p-3 rounded-xl border border-gray-700"
      />
    </div>
  );
}
