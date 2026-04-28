import { ReactNode } from "react";

export default function Button({
  variant = "primary",
  size = "sm",
  text = "Button",
  iconLeft = null,
  iconRight = null,
  iconOnly = null,
  fullW = false,
  disabled = false,
  customClass = "",
  onClick = () => {},
}: {
  variant: "primary" | "secondary" | "tertiary";
  size: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  text?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: ReactNode;
  fullW?: boolean;
  disabled?: boolean;
  customClass?: string;
  onClick?: () => void;
}) {
  const widthStyle = fullW ? "w-full" : "w-fit";

  const variantClasses = {
    primary: [
      "bg-primary-500 text-white border-2 border-primary-500",
      "hover:bg-primary-600 hover:border-primary-600",
      "active:bg-primary-700 active:border-primary-700",
      "disabled:bg-primary-200 disabled:border-primary-200 disabled:text-white disabled:cursor-not-allowed",
      "rounded-md font-medium transition-all duration-150",
      widthStyle,
    ].join(" "),
    secondary: [
      "bg-transparent text-primary-500 border-2 border-primary-500",
      "hover:bg-primary-50 hover:border-primary-600 hover:text-primary-600",
      "active:bg-primary-100 active:border-primary-700 active:text-primary-700",
      "disabled:text-primary-200 disabled:border-primary-200 disabled:cursor-not-allowed disabled:bg-transparent",
      "rounded-md font-medium transition-all duration-150",
      widthStyle,
    ].join(" "),
    tertiary: [
      "bg-transparent text-primary-500 border-2 border-transparent",
      "hover:bg-primary-50",
      "active:bg-primary-100",
      "disabled:text-primary-200 disabled:cursor-not-allowed disabled:bg-transparent",
      "rounded-md font-medium transition-all duration-150",
      widthStyle,
    ].join(" "),
  };

  const sizeClasses = iconOnly
    ? { sm: "p-[6px] text-sm", md: "p-[8px] text-base", lg: "p-[10px] text-base" }
    : { sm: "px-4 py-[6px] text-sm gap-1.5", md: "px-6 py-[8px] text-base gap-2", lg: "px-8 py-[10px] text-base gap-2" };

  const btnClasses = [
    "inline-flex items-center justify-center cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    customClass,
  ].join(" ").trim();

  return (
    <button className={btnClasses} onClick={onClick} disabled={disabled}>
      {iconOnly ? (
        <span className="flex items-center justify-center">{iconOnly}</span>
      ) : (
        <>
          {iconLeft  && <span className="flex items-center">{iconLeft}</span>}
          <span>{text}</span>
          {iconRight && <span className="flex items-center">{iconRight}</span>}
        </>
      )}
    </button>
  );
}