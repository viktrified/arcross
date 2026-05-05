"use client";

export type StepStatus = "idle" | "loading" | "done";

export type Step = {
  name: string;
  status: StepStatus;
};

export default function ProgressSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="mt-4 space-y-3">
      {steps.map((step) => (
        <div key={step.name} className="flex items-center justify-between">
          <span className="text-sm text-white">{step.name}</span>

          <span className="text-sm">
            {step.status === "done" && "✔"}
            {step.status === "loading" && "⏳"}
            {step.status === "idle" && "•"}
          </span>
        </div>
      ))}
    </div>
  );
}