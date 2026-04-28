"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import DeleteConfirmDialog from "@/components/catalog/upload/delete-confirm-dialog";

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

interface UploadFileTableProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onAddMore: () => void;
  title: string;
}

export default function UploadFileTable({
  files,
  onRemove,
  onAddMore,
  title,
}: UploadFileTableProps) {
  const isEmpty = files.length === 0;


  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground font-medium">{title}</p>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-10">No</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">File</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-20">Size</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground w-14">Remove</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={4} className="px-3 py-24 text-center text-xs text-muted-foreground">
                  No files uploaded yet
                </td>
              </tr>
            ) : (
              files.map((file, i) => (
                <tr key={file.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-2.5 text-foreground max-w-30 sm:max-w-none truncate">
                    {file.name}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{file.size}</td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: file.id, name: file.name })}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        fileName={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteTarget) onRemove(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <button
        type="button"
        onClick={onAddMore}
        className="w-full sm:w-full lg:w-fit lg:self-end flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 active:bg-primary-800 transition-colors"
      >
        <span className="text-base leading-none font-light">+</span>
        {isEmpty ? "Add files" : "Add more files"}
      </button>
    </div>
  );
}