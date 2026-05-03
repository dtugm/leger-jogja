"use client";

import { useState } from "react";

import FormField from "@/components/form-field";
import SelectField from "@/components/select-field";
import type { Role, UserStatus } from "@/components/user-management/user-table";

export interface UserFormData {
  name:     string;
  username: string;
  email:    string;
  role:     Role;
  status:   UserStatus;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onCancel: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  submitLabel?: string;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "Admin",      label: "Admin" },
  { value: "Superadmin", label: "Superadmin" },
  { value: "Guest",      label: "Guest" },
];

export default function UserForm({
  initialData,
  onCancel,
  onSubmit,
  submitLabel = "Save",
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>({
    name:     initialData?.name     ?? "",
    username: initialData?.username ?? "",
    email:    initialData?.email    ?? "",
    role:     initialData?.role     ?? "Guest",
    status:   initialData?.status   ?? "Active",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const set = (key: keyof UserFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Partial<Record<keyof UserFormData, string>> => {
    const e: Partial<Record<keyof UserFormData, string>> = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 8) e.username = "Username must be at least 8 characters";
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               e.email    = "Enter a valid email address";
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
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          error={errors.name}
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