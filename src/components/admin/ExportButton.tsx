"use client";

import { FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

type ExportCsvOptions = {
  filename: string;
  data: Record<string, string | number | boolean | null | undefined>[];
};

export function exportCsv({ filename, data }: ExportCsvOptions) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    return `"${String(value).replace(/"/g, '""')}"`;
  };
  const rows = data.map((row) => headers.map((h) => escape(row[h])).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type ExportButtonProps = {
  filename: string;
  data: Record<string, string | number | boolean | null | undefined>[];
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function ExportButton({
  filename,
  data,
  label = "Export CSV",
  disabled = false,
  className,
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      leftIcon={<FiDownload className="h-4 w-4" aria-hidden />}
      onClick={() => exportCsv({ filename, data })}
      className={className}
    >
      {label}
    </Button>
  );
}
