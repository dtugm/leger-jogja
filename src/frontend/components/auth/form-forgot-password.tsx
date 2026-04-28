"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { type ResetPasswordFormData, resetPasswordSchema } from "@/lib/validations/auth";

import Button from "../button";
import FormField from "../form-field";

export default function FormForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    console.warn("forgot password", data);
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-primary-600">Forgot Password?</h1>
        <p className="text-sm text-gray-500">Enter your email to reset your password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" type="email" registration={register("email")} error={errors.email?.message} />
        <Button variant="primary" size="md" text="Send reset link" fullW disabled={isSubmitting} />
      </form>

      <p className="text-center text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/demo/auth/login" className="text-primary-500 font-semibold">Sign in</Link>
      </p>
    </>
  );
}