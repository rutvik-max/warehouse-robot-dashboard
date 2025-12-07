// frontend/src/components/ui/Input.tsx
import React from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | false | undefined;
};

export default function Input({ label, error, className, ...rest }: Props) {
  return (
    <div className={clsx("w-full", className)}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        {...rest}
        className={clsx(
          "w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-400",
          error ? "border-red-400" : "border-gray-200"
        )}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
