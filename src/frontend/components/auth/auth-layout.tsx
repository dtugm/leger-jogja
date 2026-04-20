import AuthIllustrationAnimated from "@/components/auth/auth-illustration";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen"
        style={{
            background: `
            radial-gradient(ellipse at 15% 50%, #bfdbfe 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, #c7d2fe 0%, transparent 45%),
            radial-gradient(ellipse at 80% 85%, #bae6fd 0%, transparent 40%),
            #f0f7ff
            `,
        }}
    >
        <div className="flex min-h-screen w-[80%] mx-auto">
            
            {/* blob decorations */}
            <div className="fixed top-0 left-0 w-64 h-64 bg-blue-200 rounded-full opacity-40 blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full opacity-30 blur-3xl translate-x-1/3 translate-y-1/3" />

            {/* kiri: ilustrasi */}
            <div className="hidden lg:flex w-1/2 items-center justify-center p-12">
            <AuthIllustrationAnimated />
            </div>

            {/* kanan: form slot */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-12">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 space-y-6">
                    {children}
                </div>
            </div>

        </div>
    </div>
  );
}