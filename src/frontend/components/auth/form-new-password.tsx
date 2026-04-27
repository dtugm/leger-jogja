"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { type NewPasswordFormData, newPasswordSchema } from "@/lib/validations/auth";

import Button from "../button";
import FormField from "../form-field";

export default function FormNewPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    console.warn("new password", data);
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-primary-600">Set New Password</h1>
        <p className="text-sm text-gray-500">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="New Password" type="password" registration={register("password")} error={errors.password?.message} />
        <FormField label="Confirm Password" type="password" registration={register("confirmPassword")} error={errors.confirmPassword?.message} />
        <Button variant="primary" size="md" text="Reset Password" fullW disabled={isSubmitting} />
      </form>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/demo/auth/login" className="text-primary-500 font-semibold">Sign in</Link>
      </p>
    </>
  );
}