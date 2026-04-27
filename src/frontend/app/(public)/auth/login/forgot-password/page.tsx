// import CardResetPassword from "@/components/auth/card-forgot-password";

// export default function ForgotPasswordPage() {
//   return <CardResetPassword />;
// }

import AuthLayout from "@/components/auth/auth-layout";
import FormForgotPassword from "@/components/auth/form-forgot-password";

export default function ForgotPasswordPage() {
  return <AuthLayout><FormForgotPassword /></AuthLayout>;
}