// components/ProgressSteps.tsx

"use client";

import {
  HiCheck,
  HiOutlineFire,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";
import { useMemo } from "react";

export type StepStatus = "idle" | "loading" | "done";

export type Step = {
  name: string;
  status: StepStatus;
};

const iconMap: Record<string, React.ReactNode> = {
  Approve: <HiCheck className="w-5 h-5" />,
  Burn: <HiOutlineFire className="w-5 h-5" />,
  Attestation: <HiOutlineDocumentText className="w-5 h-5" />,
  Mint: <HiOutlineCurrencyDollar className="w-5 h-5" />,
};

export default function ProgressSteps({ steps }: { steps: Step[] }) {
  const currentStepIndex = useMemo(() => {
    return steps.findIndex((step) => step.status !== "done");
  }, [steps]);

  return (
    <div className="mt-4 px-4">
      <div className="relative flex items-center justify-between">
        {/* Progress Line Background */}
        <div className="absolute left-0 right-0 top-[23] h-[3px] bg-[#2a2a2a] -translate-y-1/2" />

        {/* Active Progress Line */}
        <div
          className="absolute left-[0.5] top-[23] h-[3px] bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 -translate-y-1/2"
          style={{
            width:
              currentStepIndex === -1
                ? "100%"
                : `${(currentStepIndex / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const isDone = step.status === "done";
          const isActive = step.status === "loading";
          const isCompleted = isDone;

          return (
            <div
              key={step.name}
              className="flex flex-col items-center relative z-10"
            >
              {/* Circle */}
              <div
                className={`
                  w-11 h-11 rounded-full border-4 flex items-center justify-center transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-blue-500 border-blue-500 text-white"
                      : isActive
                        ? "bg-blue-600 border-blue-400 animate-pulse"
                        : "bg-[#1a1a1a] border-[#444] text-gray-400"
                  }
                `}
              >
                {isCompleted ? (
                  <HiCheck className="w-6 h-6" />
                ) : (
                  iconMap[step.name] || (
                    <span className="text-lg">{index + 1}</span>
                  )
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs mt-3 font-medium transition-colors ${
                  isCompleted || isActive ? "text-white" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
