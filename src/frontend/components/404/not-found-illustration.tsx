import Illustration404 from "@/public/assets/404/404-illustration.svg";

export default function NotFoundIllustration() {
  return (
    <>
      <style>{`
        #elemen-daun-kiri {
          animation: sway 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        #elemen-daun-kanan {
          animation: sway 4s ease-in-out infinite reverse;
          transform-origin: bottom center;
        }
        #elemen-garis-atas {
          animation: float 3s ease-in-out infinite;
          transform-origin: center;
        }
        #elemen-shape-bg {
          animation: pulse 4s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>

      <Illustration404 className="w-full max-w-xs" />
    </>
  );
}