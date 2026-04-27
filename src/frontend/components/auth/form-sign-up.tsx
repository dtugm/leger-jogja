"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { type SignUpFormData, signUpSchema } from "@/lib/validations/auth";

import Button from "../button";
import FormField from "../form-field";

export default function FormSignUp() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    console.warn("sign up", data);
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-primary-600">Create your account!</h1>
        <p className="text-sm text-gray-500">Sign up to explore the app</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" registration={register("fullName")} error={errors.fullName?.message} />
        <FormField label="Username" registration={register("username")} error={errors.username?.message} />
        <FormField label="Email" type="email" registration={register("email")} error={errors.email?.message} />
        <FormField label="Password" type="password" registration={register("password")} error={errors.password?.message} />
        <Button variant="primary" size="md" text="Sign Up" fullW disabled={isSubmitting} />
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/demo/auth/login" className="text-primary-500 font-semibold">Sign in</Link>
      </p>
    </>
  );
}