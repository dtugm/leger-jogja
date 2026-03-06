import CesiumViewer from "@/components/cesium/CesiumViewerDynamic";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default function Home() {
  return (
    <>
      <LeftSidebar />
      <main className="relative flex-1 overflow-hidden">
        <CesiumViewer />
      </main>
      <RightSidebar />
    </>
  );
}
