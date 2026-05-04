"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { useApiHandler } from "@/hooks/use-api-handler";
import { type SignUpFormData, signUpSchema } from "@/lib/validations/auth";
import { AuthApi } from "@/services/api/auth.api";

import Button from "../button";
import FormField from "../form-field";

export default function FormSignUp() {
  const router = useRouter();
  const { execute, isLoading } = useApiHandler();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignUpFormData) => {
    const res = await execute({
      request: () =>
        AuthApi.register({
          fullname: data.fullName,
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      successMessage: "Account created successfully!",
    });

    if (res.success) {
      router.push("/auth/login");
    }
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-600">Create your account!</h1>
        <p className="text-sm text-muted-foreground">Sign up to explore the app</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
          <FormField 
            label="Full Name" 
            placeholder="e.g. Andi Prasetyo"
            value={field.value ?? ""} 
            onChange={field.onChange}
            error={errors.fullName?.message} 
            labelClassName="text-gray-700" 
            inputClassName="bg-white border-gray-200 text-gray-900 
            placeholder:text-gray-400"/>
            )}
        />
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
          <FormField 
            label="Username" 
            placeholder="e.g. andipr"
            value={field.value ?? ""} 
            onChange={field.onChange}
            error={errors.username?.message} 
            labelClassName="text-gray-700" 
            inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"/>
          )}
      />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
          <FormField 
            label="Email" 
            type="email"
            placeholder="e.g. andipr@email.com"
            value={field.value ?? ""} 
            onChange={field.onChange}
            error={errors.email?.message} 
            labelClassName="text-gray-700" 
            inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"/>
          )}
      />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
          <FormField 
            label="Password" 
            type="password"
            placeholder="e.g. @Y0UrP4s5w0rD"
            value={field.value ?? ""} 
            onChange={field.onChange}
            error={errors.password?.message} 
            labelClassName="text-gray-700" 
            inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400" />
          )}
      />
        <Button variant="primary" size="md" text="Sign Up" fullW disabled={isLoading}/>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary-500 font-semibold">Sign in</Link>
      </p>
    </>
  );
}