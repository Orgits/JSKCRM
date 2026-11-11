"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { FileCheckCorner, CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FieldLabel } from "./Field";
import { iconProps } from "./icon";

export type UploadedFile = { name: string; size: number };

export type UploadTileProps = {
  /** Document name, e.g. "Aadhaar card". */
  label: ReactNode;
  required?: boolean;
  /** e.g. "PDF, JPG or PNG · max 2 MB". */
  hint?: ReactNode;
  accept?: string;
  /** Files larger than this are rejected with an error. */
  maxSizeMB?: number;
  /** Controlled value. Leave undefined to let the tile track its own file. */
  file?: UploadedFile | null;
  onFileChange?: (file: File | null) => void;
  error?: ReactNode;
  name?: string;
  className?: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Figma "Document Upload" — State: Empty (dashed drop target) | Uploaded (file row with remove). */
export function UploadTile({
  label,
  required,
  hint = "PDF, JPG or PNG · max 2 MB",
  accept = "application/pdf,image/jpeg,image/png",
  maxSizeMB = 2,
  file,
  onFileChange,
  error,
  name,
  className,
}: UploadTileProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [ownFile, setOwnFile] = useState<UploadedFile | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const current = file !== undefined ? file : ownFile;
  const shownError = error ?? sizeError;

  function select(f: File | null) {
    if (f && f.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`File is larger than ${maxSizeMB} MB`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setSizeError(null);
    setOwnFile(f ? { name: f.name, size: f.size } : null);
    if (!f && inputRef.current) inputRef.current.value = "";
    onFileChange?.(f);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <FieldLabel htmlFor={inputId} required={required}>
        {label}
      </FieldLabel>

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => select(e.target.files?.[0] ?? null)}
      />

      {current ? (
        <div className="flex items-center gap-3 rounded-control border border-success-600 bg-success-50 px-3.5 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-neutral-surface text-success-600">
            <FileCheckCorner {...iconProps} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-5 font-semibold text-text-primary">{current.name}</p>
            <p className="text-xs leading-4 font-medium text-text-secondary">
              {formatSize(current.size)} · Uploaded
            </p>
          </div>
          <button
            type="button"
            onClick={() => select(null)}
            aria-label="Remove file"
            className="flex size-8 shrink-0 items-center justify-center rounded-control text-text-secondary outline-none hover:bg-neutral-surface hover:text-danger-600 focus-visible:shadow-focus"
          >
            <X size={18} strokeWidth={1.6} aria-hidden />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            select(e.dataTransfer.files?.[0] ?? null);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-2 rounded-control border border-dashed px-4 py-5 text-center transition-colors",
            dragging
              ? "border-brand-600 bg-brand-50"
              : shownError
                ? "border-danger-600 bg-danger-50"
                : "border-neutral-border-strong bg-neutral-subtle hover:border-brand-500 hover:bg-brand-50",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CloudUpload {...iconProps} />
          </span>
          <span className="text-sm leading-5 font-semibold text-brand-600">
            Click to upload <span className="font-normal text-text-secondary">or drag and drop</span>
          </span>
          {hint && <span className="text-xs leading-4 font-medium text-text-muted">{hint}</span>}
        </label>
      )}

      {shownError && (
        <p role="alert" className="text-[13px] leading-[18px] text-danger-600">
          {shownError}
        </p>
      )}
    </div>
  );
}
