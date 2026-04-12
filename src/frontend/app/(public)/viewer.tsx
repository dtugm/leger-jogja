import CesiumViewerDynamic from "@/components/cesium/CesiumViewerDynamic";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default function CesiumViewer() {
    return (
        <div className="flex h-screen overflow-hidden">
            <LeftSidebar />
            <main className="relative flex-1 overflow-hidden">
                <CesiumViewerDynamic />
            </main>
            <RightSidebar />
        </div>
    );
}
