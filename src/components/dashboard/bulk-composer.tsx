"use client";

import {
  ArrowRight,
  ClipboardList,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/constants/routes";
import {
  DEFAULT_LIST_NAME,
  BulkJobStatus,
  MAX_BULK_EMAILS,
  MAX_LIST_NAME_LENGTH,
} from "@/constants/validation";
import { CsvHelper } from "@/helpers/csv";
import { EmailHelper } from "@/helpers/email";
import { ErrorMessageHelper } from "@/helpers/error-message";
import { useCreateBulkJob } from "@/hooks/use-bulk-job";
import { cn } from "@/lib/utils";

const ComposerTab = {
  PASTE: "paste",
  UPLOAD: "upload",
} as const;

type ComposerTab = (typeof ComposerTab)[keyof typeof ComposerTab];

const TABS = [
  { key: ComposerTab.PASTE, label: "Paste a list", icon: ClipboardList },
  { key: ComposerTab.UPLOAD, label: "Upload a file", icon: UploadCloud },
] as const;

export function BulkComposer() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<ComposerTab>(ComposerTab.PASTE);
  const [raw, setRaw] = useState("");
  const [file, setFile] = useState<{ name: string; emails: string[] } | null>(null);
  const [name, setName] = useState("");
  const [dragging, setDragging] = useState(false);
  const createBulk = useCreateBulkJob();

  const { valid, invalid } = useMemo(() => {
    const source =
      tab === ComposerTab.PASTE ? EmailHelper.parseList(raw) : (file?.emails ?? []);
    return EmailHelper.filterValid(source);
  }, [tab, raw, file]);

  const overLimit = valid.length > MAX_BULK_EMAILS;

  async function loadFile(selected: File) {
    const emails = CsvHelper.parseEmailsFromText(await selected.text());
    if (!emails.length) {
      toast.error("No email addresses found in that file");
      return;
    }
    setFile({ name: selected.name, emails });
    if (!name) setName(selected.name.replace(/\.[^.]+$/, ""));
  }

  async function onSubmit() {
    if (!valid.length || overLimit) return;
    try {
      const job = await createBulk.mutateAsync({
        emails: valid,
        name: name.trim() || undefined,
      });
      toast.success(
        job.status === BulkJobStatus.PENDING
          ? "Queued. It starts when another list finishes."
          : `Validating ${valid.length} addresses`,
      );
      router.push(AppRoutes.dashboardJob(job.jobId));
    } catch (error) {
      toast.error(ErrorMessageHelper.toMessage(error, "Failed to start validation"));
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_50px_-20px] shadow-brand-900/20">
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-border px-3">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors",
              tab === key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4", tab === key && "text-brand-600")} />
            {label}
            <span
              className={cn(
                "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600 transition-opacity",
                tab === key ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
        ))}
      </div>

      {tab === ComposerTab.PASTE ? (
        <div className="p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Paste each address on a new line. Max {MAX_BULK_EMAILS.toLocaleString()} addresses at once.
          </p>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={"address.one@mail.com\naddress.two@gmail.com\n…"}
            className="min-h-40 w-full resize-y bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      ) : (
        <div className="p-4">
          {file ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="grid size-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.emails.length.toLocaleString()} addresses found
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setFile(null)}
                aria-label="Remove file"
              >
                <X />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) void loadFile(dropped);
              }}
              className={cn(
                "flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors",
                dragging
                  ? "border-brand-400 bg-brand-50"
                  : "border-border hover:border-brand-300 hover:bg-surface",
              )}
            >
              <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
                <UploadCloud className="size-6" />
              </span>
              <span className="text-sm">
                <span className="font-medium text-brand-600">Click to upload</span>{" "}
                or drag and drop
              </span>
              <span className="text-xs text-muted-foreground">CSV or TXT · one email per row</span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) void loadFile(selected);
              e.target.value = "";
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border bg-surface/70 px-4 py-3 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_LIST_NAME_LENGTH}
          placeholder={DEFAULT_LIST_NAME}
          aria-label="List name"
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-100 sm:w-52"
        />
        <p className="text-xs text-muted-foreground">
          <span className={cn("font-semibold", overLimit ? "text-rose-600" : "text-foreground")}>
            {valid.length.toLocaleString()}
          </span>{" "}
          valid
          {invalid.length ? ` · ${invalid.length} skipped` : ""}
          {valid.length ? ` · ${valid.length.toLocaleString()} credits` : ""}
          {overLimit ? ` · max ${MAX_BULK_EMAILS.toLocaleString()}` : ""}
        </p>
        <Button
          onClick={onSubmit}
          disabled={!valid.length || overLimit || createBulk.isPending}
          className="h-9 w-full rounded-lg px-4 sm:ml-auto sm:w-auto"
        >
          {createBulk.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              Validate list <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
