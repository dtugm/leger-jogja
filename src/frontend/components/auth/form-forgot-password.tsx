"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { useApiHandler } from "@/hooks/use-api-handler";
import { type ResetPasswordFormData, resetPasswordSchema } from "@/lib/validations/auth";
import { AuthApi } from "@/services/api/auth.api";

import Button from "../button";
import FormField from "../form-field";

export default function FormForgotPassword() {
  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
     mode: "onChange",
  });

  const { execute, isLoading } = useApiHandler();

  const onSubmit = async (data: ResetPasswordFormData) => {
    await execute({
      request: () => AuthApi.forgotPassword(data.email),
      successMessage: "Reset link sent! Check your email.",
    });
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-600">Forgot Password?</h1>
        <p className="text-sm text-muted-foreground">Enter your email to reset your password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormField 
              label="Email" 
              type="email"
              placeholder="e.g andipr@gmail.com" 
              value={field.value ?? ""} 
              onChange={field.onChange}
              error={errors.email?.message} 
              labelClassName="text-gray-700" 
              inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          )}
        />
        <Button variant="primary" size="md" text="Send reset link" fullW disabled={isLoading} />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary-500 font-semibold">Sign in</Link>
      </p>
    </>
  );
}