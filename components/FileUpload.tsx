"use client";

import { useRef, useState } from "react";

interface FileUploadProps {
  onTextExtracted: (text: string, fileName: string) => void;
  accept?: string;
}

export default function FileUpload({ onTextExtracted, accept = ".pdf,.docx,.doc,.txt,.md,.csv" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    setState("loading");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      onTextExtracted(json.text, file.name);
      setState("idle");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to read file.");
      setState("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="mb-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-5 cursor-pointer transition-all"
        style={{
          borderColor: dragOver ? "#00D4FF" : "#1E2D4A",
          background: dragOver ? "#00D4FF08" : "transparent",
        }}
      >
        {state === "loading" ? (
          <>
            <svg className="w-5 h-5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-slate-400">Extracting text...</p>
          </>
        ) : (
          <>
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm text-slate-400">
              <span style={{ color: "#00D4FF" }}>Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-slate-600">PDF, DOCX, TXT, MD, CSV supported</p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
