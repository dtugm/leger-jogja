"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UploadSuccessModalProps {
  assetName: string;
  open: boolean;
  onClose: () => void;
  onSchedule: (date: string) => void;
  onSkip: () => void;
}

export default function UploadSuccessModal({
  assetName,
  open,
  onClose,
  onSchedule,
  onSkip,
}: UploadSuccessModalProps) {
  const [date, setDate] = useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)]max-w-sm rounded-2xl p-5 sm:p-8">

        <div className="flex justify-center mb-5">
          <div className="flex  h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-success/30 bg-success/10">
            <Check className="h-6 w-6 sm:h-7 sm:w-7 text-(--color-success) stroke-[2.5]" />
          </div>
        </div>

        <DialogHeader className="text-center mb-6">
          <DialogTitle className="text-base font-semibold text-foreground">
            {assetName} <span className="text-muted-foreground">Saved.</span>
          </DialogTitle>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Asset has been registered. Now, schedule the first inspection so the condition baseline is recorded.
          </p>
        </DialogHeader>

        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Schedule first inspection</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A baseline inspection helps determine maintenance needs later.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground">Inspection date</label>
            <div className="flex flex-col xs:flex-row gap-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => date && onSchedule(date)}
                disabled={!date}
                className="rounded-lg border border-border bg-background px-4 py-2 sm:py-2.5 xs:w-autow-full text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now - i&apos;ll add it from timeline
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}