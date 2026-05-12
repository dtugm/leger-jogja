"use client";

import { useState } from "react";

import FormField from "@/components/form-field";
import SelectField from "@/components/select-field";
import type { Role } from "@/components/user-management/user-table";

export interface UserFormData {
  fullname: string;
  username: string;
  email:    string;
  role:     Role;
  password?: string; 
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onCancel: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  submitLabel?: string;
  isEdit?: boolean;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "admin",      label: "Admin" },
  { value: "super_admin", label: "Superadmin" },
  { value: "user",      label: "User" },
];

export default function UserForm({
  initialData,
  onCancel,
  onSubmit,
  submitLabel = "Save",
  isEdit = false,
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>({
    fullname: initialData?.fullname ?? "",
    username: initialData?.username ?? "",
    email:    initialData?.email    ?? "",
    role:     initialData?.role     ?? "user",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const set = (key: keyof UserFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Partial<Record<keyof UserFormData, string>> => {
    const e: Partial<Record<keyof UserFormData, string>> = {};
    if (!form.fullname.trim())     e.fullname     = "Full name is required";
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 8) e.username = "Username must be at least 8 characters";
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               e.email    = "Enter a valid email address";
    if (!isEdit && !form.password?.trim()) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    try {
      await onSubmit(form);
    } catch (error) {
        if ((error as { status?: number })?.status === 409) {
        setErrors({ email: "Email already registered" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">General Information</h3>
        <hr className="border-border" />
        <FormField
          label="Full Name"
          placeholder="e.g. Andi Prasetyo"
          value={form.fullname}
          onChange={(e) => set("fullname")(e.target.value)}
          error={errors.fullname}
        />
        <FormField
          label="Username"
          placeholder="e.g. andipr"
          value={form.username}
          onChange={(e) => set("username")(e.target.value)}
          error={errors.username}
        />
        <FormField
          label="Email"
          placeholder="e.g. andipr@gmail.com"
          value={form.email}
          onChange={(e) => set("email")(e.target.value)}
          error={errors.email}
        />
        {!isEdit && (
          <FormField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => set("password")(e.target.value)}
            error={errors.password}
          />
        )}
      </section>

      <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-6 sm:py-5 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Access</h3>
        <hr className="border-border" />
        <div>
          <SelectField
            label="Role"
            value={form.role}
            onChange={set("role")}
            options={ROLE_OPTIONS}
            placeholder="Select role"
            error={errors.role}
          />
        </div>
      </section>

      <div className="flex justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-primary-600 px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}