import UploadIllustration from "@/public/assets/catalog/upload-illustration.svg";

export default function UploadIllustrationAnimated() {
  return (
    <>
    <div className="flex items-center justify-center w-full py-4 lg:py-0">
        <style>{`
            #elemen-daun-kiri {
            animation: openLeft 3s ease-in-out infinite;
            transform-origin: bottom center;
            transform-box: fill-box;
            }
            #elemen-daun-kanan {
            animation: openRight 3s ease-in-out infinite;
            transform-origin: bottom center;
            transform-box: fill-box;
            }
            #elemen-lingkaran-kanan {
            animation: float 3s ease-in-out infinite;
            transform-origin: center;
            transform-box: fill-box;
            }
            #elemen-lingkaran-tengah {
            animation: float 3s ease-in-out 0.5s infinite;
            transform-origin: center;
            transform-box: fill-box;
            }
            #elemen-lingkaran-kiri {
            animation: float 3s ease-in-out 1s infinite;
            transform-origin: center;
            transform-box: fill-box;
            }
            svg {
            overflow: visible;
            }

            @keyframes openLeft {
            0%, 100% { transform: rotate(0deg); }
            50%       { transform: rotate(-12deg); }
            }
            @keyframes openRight {
            0%, 100% { transform: rotate(0deg); }
            50%       { transform: rotate(12deg); }
            }
            @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-8px); }
            }
        `}</style>

        <UploadIllustration className="w-full max-w-45 sm:max-w-100 lg:max-w-sm" />
    </div>
    </>
  );
}