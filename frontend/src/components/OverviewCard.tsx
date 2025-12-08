// frontend/src/components/OverviewCard.tsx
import clsx from "clsx";

type Props = {
  title: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "positive" | "danger" | "accent";
};

export default function OverviewCard({ title, value, hint, tone = "neutral" }: Props) {
  const toneClass = {
    neutral: "bg-white",
    positive: "bg-green-50 border-green-200",
    danger: "bg-red-50 border-red-200",
    accent: "bg-indigo-50 border-indigo-200",
  }[tone];

  return (
    <div className={clsx("rounded-lg p-4 shadow-sm border", toneClass)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
        <div className="text-xs text-gray-400">{hint}</div>
      </div>
    </div>
  );
}
