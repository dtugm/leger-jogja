"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import ParsingResultTable, { type ParsingResult } from "@/components/catalog/upload/parsing-result-table";
import UploadFileTable, { type UploadedFile } from "@/components/catalog/upload/upload-file-table";
import UploadForm, { type UploadFormData } from "@/components/catalog/upload/upload-form";
import UploadIllustration from "@/components/catalog/upload/upload-illustration";
import UploadSuccessModal from "@/components/catalog/upload/upload-success-modal";
import PageHeader from "@/components/page-header";

// ganti API call yakkk
const DUMMY_PARSING: ParsingResult[] = [
{ no: 1, result: "Curb",         total: 6 },
{ no: 2, result: "Separator",    total: 6 },
{ no: 3, result: "Road marking", total: "..." },
{ no: 4, result: "Road barrier", total: "..." },
];

type PageState = "upload" | "form" | "success";

export default function CatalogUploadPage() {
const fileInputRef = useRef<HTMLInputElement>(null);

const [pageState, setPageState] = useState<PageState>("upload");
const [files, setFiles]         = useState<UploadedFile[]>([]);
const [savedName, setSavedName] = useState("");

const router = useRouter();

const handleAddMore = () => fileInputRef.current?.click();

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const newFiles: UploadedFile[] = picked.map((f) => ({
    id:   Date.now() + f.name,
    name: f.name.replace(/\.[^.]+$/, ""),
    size: `${(f.size / 1024 / 1024).toFixed(2)}MiB`,
    }));
    const next = [...files, ...newFiles];
    setFiles(next);
    if (next.length >= 1) setPageState("form");
    e.target.value = "";
};

const handleRemove = (id: string) => {
    const next = files.filter((f) => f.id !== id);
    setFiles(next);
    if (next.length < 1) setPageState("upload");
};

const handleUpload = (data: UploadFormData) => {
    setSavedName(data.assetName || "Asset");
    setPageState("success");
};

const handleCancel = () => {
    setFiles([]);
    setPageState("upload");
};

return (
    <div className="mx-auto w-[90%] py-6 sm:py-8 xl:max-w-[80%]">
    <PageHeader
        title="Asset Catalog"
        subtitle="Comprehensive database of road and bridge infrastructure assets"
    />

    <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json,.geojson,.kml,.shp,.csv"
        onChange={handleFileChange}
        className="hidden"
    />

    {pageState === "upload" && (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="w-full lg:w-2/5 shrink-0 rounded-2xl border border-border bg-card p-4 sm:p-6 lg:min-h-100 flex flex-col">
            <UploadFileTable
                files={files}
                onRemove={handleRemove}
                onAddMore={handleAddMore}
                title={`Uploaded (${files.length} item${files.length !== 1 ? "s" : ""})`}
            />
        </div>
        <div className="w-full lg:flex-1 flex items-center justify-center py-4 lg:py-0 lg:self-stretch">
            <UploadIllustration />
        </div>
    </div>
    )}

    {pageState === "form" && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)]">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
            <div className="w-full lg:w-1/3 shrink-0 flex flex-col gap-5">
                <UploadFileTable
                    files={files}
                    onRemove={handleRemove}
                    onAddMore={handleAddMore}
                    title={`Uploaded (${files.length} items)`}
                />
                <ParsingResultTable results={DUMMY_PARSING} />
            </div>
            <div className="w-full lg:flex-1 min-h-0">
                <p className="text-sm font-medium mb-4">Metadata Information</p>
                <UploadForm
                    onCancel={handleCancel}
                    onUpload={handleUpload}
                />
            </div>
        </div>
        </div>
    )}

    {pageState === "success" && (
        <>
        <div className="rounded-2xl border border-border bg-card p-6 opacity-40 pointer-events-none">
            <p className="text-sm text-muted-foreground">Uploading…</p>
        </div>
        <UploadSuccessModal
            open={true}
            assetName={savedName}
            onClose={() => router.push("/catalog")}
            onSchedule={(date) => {
                // ganti API call yakkk
                console.warn("Scheduled inspection:", date);
                router.push("/catalog");
            }}
            onSkip={() => router.push("/catalog")}
        />
        </>
    )}
    </div>
);
}