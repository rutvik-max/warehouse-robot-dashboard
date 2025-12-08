// button code
import React from "react";
import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function Button({ variant = "primary", className, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={clsx(
        "px-4 py-2 rounded-md font-medium transition disabled:opacity-60",
        variant === "primary"
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "bg-transparent text-indigo-600 border border-indigo-600 hover:bg-indigo-50",
        className
      )}
    >
      {children}
    </button>
  );
}
