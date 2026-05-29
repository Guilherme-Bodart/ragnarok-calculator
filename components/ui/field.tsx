import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  children: ReactNode;
  className?: string;
  label: ReactNode;
};

type InputProps = InputHTMLAttributes<HTMLInputElement>;

type FieldValueProps = {
  children: ReactNode;
  title?: string;
};

export function Field({ children, className, label }: FieldProps) {
  return (
    <label className={cn("ui-field", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputProps) {
  return <input className={cn("ui-input", className)} {...props} />;
}

export function FieldValue({ children, title }: FieldValueProps) {
  return (
    <span className="ui-field-value" title={title}>
      {children}
    </span>
  );
}
