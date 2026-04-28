"use client";

import { Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  open,
  fileName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-6">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <DialogHeader className="text-center mb-2">
          <DialogTitle className="text-base font-semibold text-foreground">
            Remove this file?
          </DialogTitle>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{fileName}</span> will be removed from the upload list.
          </p>
        </DialogHeader>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:bg-destructive/90 active:bg-destructive/80 transition-colors"
          >
            Remove
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}