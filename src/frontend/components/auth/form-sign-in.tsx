"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { type SignInFormData, signInSchema } from "@/lib/validations/auth";
import { authService } from "@/services/api/auth"; 
import { useAuthStore } from "@/store/auth-store";

import Button from "../button";
import FormField from "../form-field";

export default function FormSignIn() {
  const router = useRouter(); 

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const res = await authService.signIn(data);
      useAuthStore.getState().setAuth(res.data.user, res.data.token);
      router.push("/dashboard");
    } catch{
      setError("email", { message: "Incorrect email or password" });
      setError("password", { message: "Incorrect email or password" });
    }
  };

  return (
    <>
      <div className="space-y-1 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-primary-600">Welcome back!</h1>
        <p className="text-sm text-muted-foreground">Sign in to explore the app</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" type="email" registration={register("email")} error={errors.email?.message} labelClassName="text-gray-700" inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"/>
        <FormField label="Password" type="password" registration={register("password")} error={errors.password?.message} labelClassName="text-gray-700" inputClassName="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"/>
        <Button variant="primary" size="md" text="Sign In" fullW disabled={isSubmitting} />
      </form>

      <div className="text-center">
        <Link href="/auth/login/forgot-password" className="text-sm text-primary-500 font-semibold">
          Forgot password
        </Link>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have any account?{" "}
        <Link href="/auth/signup" className="text-primary-500 font-semibold">Sign up</Link>
      </p>
    </>
  );
}