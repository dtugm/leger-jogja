"use client";

import { Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  open,
  title = "Remove this item?",
  description,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-4 sm:p-6">

        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-destructive/30 bg-destructive/10">
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
          </div>
        </div>

        <DialogHeader className="text-center mb-1 sm:mb-2">
          <DialogTitle className="text-sm sm:text-base font-semibold text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </DialogHeader>

        <div className="flex gap-2 mt-3 sm:mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-destructive px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-destructive/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}