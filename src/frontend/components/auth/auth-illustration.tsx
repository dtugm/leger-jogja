// components/auth/auth-illustration.tsx
import AuthIllustration from "@/public/assets/auth/auth-illustration.svg";

export default function AuthIllustrationAnimated() {
  return (
    <>
      <style>{`
        #elemen-pesawat {
            animation: float 3s ease-in-out infinite;
            transform-origin: center;
        }
        #elemen-daun-kiri {
            animation: sway 4s ease-in-out infinite;
            transform-origin: bottom center;
        }
        #elemen-daun-kanan {
            animation: sway 4s ease-in-out infinite reverse;
            transform-origin: bottom center;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-8px); }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        @keyframes sway {
            0%, 100% { transform: rotate(-3deg); }
            50%       { transform: rotate(3deg); }
        }
      `}</style>

        <AuthIllustration className="w-full max-w-xl" />
    </>
  );
}