import { InputHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
    label: string;
    type?: InputHTMLAttributes<HTMLInputElement>["type"];
    placeholder?: string;
    error?: string;
    registration: UseFormRegisterReturn;
}

export default function FormField({ label, type = "text", placeholder, error, registration }: FormFieldProps) {
    return (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-800">{label}</label>
        <input
            {...registration}
            type={type}
            placeholder={placeholder ?? label}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-1 focus:ring-primary-500"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
    );
}