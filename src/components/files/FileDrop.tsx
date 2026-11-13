'use client';

import { useId, useState, type DragEvent } from 'react';

export interface UploadedFile {
  url: string;
  name: string;
}

interface FileDropProps {
  readonly label: string;
  readonly onUploaded: (file: UploadedFile) => void;
}

const ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp';

/** Drag a PDF or photo here, or tap to choose one. Uploads straight away and reports the result. */
export function FileDrop({ label, onUploaded }: FileDropProps) {
  const inputId = useId();
  const [isOver, setIsOver] = useState(false);
  const [status, setStatus] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setStatus(`Uploading ${file.name}…`);
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/files', { method: 'POST', body }).catch(() => null);
    const result: unknown = await response?.json().catch(() => null);
    if (!response?.ok || typeof result !== 'object' || result === null || !('url' in result)) {
      const message =
        result && typeof result === 'object' && 'error' in result ? String(result.error) : '';
      setStatus(message || 'The upload did not work. Try again.');
      return;
    }
    const uploaded = { url: String(result.url), name: file.name };
    setStatus(`✓ ${file.name} uploaded`);
    onUploaded(uploaded);
  };

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsOver(false);
    void upload(event.dataTransfer.files[0]);
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={drop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed p-5 text-center text-sm ${isOver ? 'border-jacaranda-500 bg-jacaranda-50' : 'border-ink/20 bg-white'}`}
      >
        <span className="text-2xl" aria-hidden="true">
          ⬆
        </span>
        <span className="font-semibold">{label}</span>
        <span className="text-xs">Drag a PDF or photo here, or tap to choose (up to 3 MB)</span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      <output className="text-sm">{status}</output>
    </div>
  );
}
