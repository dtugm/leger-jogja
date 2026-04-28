"use client";

import { useState } from "react";

import FormField from "@/components/form-field";
import MultiSelectField from "@/components/multi-select-field";
import NumberField from "@/components/number-field";
import SelectField from "@/components/select-field";

export interface UploadFormData {
  assetName: string;
  description: string;
  totalLength: string;
  width: string;
  materials: string[];
  yearBuilt: string;
  buildBy: string;
}

interface UploadFormProps {
  initialData?: Partial<UploadFormData>;
  onCancel: () => void;
  onUpload: (data: UploadFormData) => void;
}

const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => {
  const y = String(2025 - i);
  return { value: y, label: y };
});

const MATERIAL_OPTIONS = ["Concrete", "Asphalt", "Gravel", "Steel", "Wood", "Composite"];

export default function UploadForm({ initialData, onCancel, onUpload }: UploadFormProps) {

const [errors, setErrors] = useState<Partial<Record<keyof UploadFormData, string>>>({});

const validate = () => {
  const newErrors: Partial<Record<keyof UploadFormData, string>> = {};
  if (!form.assetName.trim())   newErrors.assetName   = "Asset name is required";
  if (!form.description.trim()) newErrors.description = "Description is required";
  if (!form.totalLength || isNaN(Number(form.totalLength))) 
    newErrors.totalLength = "Total length must be a valid number";
  if (!form.width || isNaN(Number(form.width))) 
    newErrors.width = "Width must be a valid number";
  if (!form.materials.length)   newErrors.materials   = "Select at least one material";
  if (!form.yearBuilt)          newErrors.yearBuilt   = "Year built is required";
  if (!form.buildBy.trim())     newErrors.buildBy     = "Build by is required";
  return newErrors;
};

const handleSubmit = () => {
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  setErrors({});
  onUpload(form);
};

  const [form, setForm] = useState<UploadFormData>({
    assetName:   initialData?.assetName   ?? "",
    description: initialData?.description ?? "",
    totalLength: initialData?.totalLength ?? "",
    width:       initialData?.width       ?? "",
    materials:   initialData?.materials   ?? [],
    yearBuilt:   initialData?.yearBuilt   ?? "",
    buildBy:     initialData?.buildBy     ?? "",
  });

  const set = (key: keyof UploadFormData) => (value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">

        <section className="px-4 py-4 sm:px-6 sm:py-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            General information
          </h3>

          <hr className="border-border" />

          <div className="flex flex-col gap-1">
            <FormField
              label="Asset Name"
              placeholder="e.g. Jalan Kaliurang"
              value={form.assetName}
              onChange={(e) => set("assetName")(e.target.value)}
              error={errors.assetName}
            />
          </div>

          <div className="flex flex-col gap-1">
            <FormField
              label="Description"
              placeholder="e.g. Pembangunan Jalan Kaliurang KM 5-15 Periode 2025"
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              error={errors.description}
            />
          </div>
        </section>

        <section className="px-6 py-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            Dimensions
          </h3>

          <hr className="border-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberField
              label="Total Length (KM)"
              value={form.totalLength}
              onChange={set("totalLength")}
              placeholder="0"
              min={0}
              step={0.01}
              error={errors.totalLength}
            />
            <NumberField
              label="Width (M)"
              value={form.width}
              onChange={set("width")}
              placeholder="0"
              min={0}
              step={0.5}
              error={errors.width}
            />
          </div>

          <MultiSelectField
            label="Material"
            value={form.materials}
            onChange={(v) => set("materials")(v)}
            options={MATERIAL_OPTIONS}
            placeholder="Select materials..."
            error={errors.materials}
          />
        </section>

        <section className="px-6 py-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            Additional Information
          </h3>

          <hr className="border-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Year Built"
              value={form.yearBuilt}
              onChange={set("yearBuilt")}
              options={YEAR_OPTIONS}
              placeholder="Select year"
              error={errors.yearBuilt}
            />
            <div className="flex flex-col gap-1">
              <FormField
                label="Build By"
                placeholder="e.g. Pemerintah Daerah Sleman"
                value={form.buildBy}
                onChange={(e) => set("buildBy")(e.target.value)}
                error={errors.buildBy}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 flex justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-primary-600 px-5 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
        >
          Upload
        </button>
      </div>
    </div>
  );
}