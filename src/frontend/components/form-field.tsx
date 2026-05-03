import { InputHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";

interface FormFieldProps {
    label: string;
    type?: InputHTMLAttributes<HTMLInputElement>["type"];
    placeholder?: string;
    error?: string;
    registration?: UseFormRegisterReturn;
    value?: string;
    inputClassName?: string;
    labelClassName?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormField({ label, type = "text", placeholder, error, registration, value, inputClassName, labelClassName, onChange }: FormFieldProps) {
    return (
    <div className="space-y-1">
<<<<<<< HEAD
        <label className={`text-sm font-medium ${labelClassName ?? "text-foreground"}`}>{label}</label>
=======
        <label className={`text-sm font-medium ${labelClassName} ?? "text-foreground"`}>{label}</label>
>>>>>>> 0af0e46bb0863ad3864c1db7b9077dedffe34d19
        <Input
            {...registration}
            className={inputClassName}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder ?? label}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
    );
}