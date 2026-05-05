"use client";

type Step = {
  name: string;
  status: "idle" | "loading" | "done";
};

export default function ProgressSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="mt-4 space-y-2">
      {steps.map((step) => (
        <div key={step.name} className="flex justify-between text-sm">
          <span>{step.name}</span>
          <span>
            {step.status === "done" && "✔"}
            {step.status === "loading" && "⏳"}
            {step.status === "idle" && "•"}
          </span>
        </div>
      ))}
    </div>
  );
}