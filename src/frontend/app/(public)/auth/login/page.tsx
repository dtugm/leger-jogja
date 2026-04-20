import AuthLayout from "@/components/auth/auth-layout";
import FormSignIn from "@/components/auth/form-sign-in";

export default function LoginPage() {
  return (
    <AuthLayout>
      <FormSignIn />
    </AuthLayout>
  );
}