"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/dist/client/components/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { useApiHandler } from "@/hooks/use-api-handler";
import { type NewPasswordFormData, newPasswordSchema } from "@/lib/validations/auth";
import { AuthApi } from "@/services/api/auth.api";

import Button from "../button";
import FormField from "../form-field";

export default function FormNewPassword() {
  const router = useRouter();
  const { execute, isLoading } = useApiHandler();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { control, handleSubmit, formState: { errors } } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    if (!token) return;
    
    await execute({
      request: () => AuthApi.resetPassword(token, data.password),
      successMessage: "Password berhasil direset!",
    });

    router.push("/auth/login");
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-600">Set New Password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormField 
              label="New Password" 
              type="password" 
              placeholder=" @NewP4s5w0RD"
              value={field.value ?? ""} 
              onChange={field.onChange}
              error={errors.password?.message} 
              labelClassName="text-gray-700" 
              inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <FormField 
              label="Confirm Password" 
              type="password" 
              placeholder=" @NewP4s5w0RD"
              value={field.value ?? ""} 
              onChange={field.onChange}
              error={errors.confirmPassword?.message} 
              labelClassName="text-gray-700" 
              inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          )}
        />
        <Button variant="primary" size="md" text="Reset Password" fullW disabled={isLoading} />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/auth/login" className="text-primary-500 font-semibold">Sign in</Link>
      </p>
    </>
  );
}