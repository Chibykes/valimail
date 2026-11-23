import { EmailHelper } from "@/helpers/email";

export class CsvHelper {
  static parseEmailsFromText(content: string): string[] {
    const lines = content.split(/\r?\n/);
    const emails: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const cells = trimmed.split(/[,;\t]/);
      for (const cell of cells) {
        const candidate = EmailHelper.normalize(cell.replace(/^["']|["']$/g, ""));
        if (candidate.includes("@")) {
          emails.push(candidate);
        }
      }
    }

    return Array.from(new Set(emails));
  }

  static toCsv(
    rows: Array<Record<string, string | number | boolean | null | undefined>>,
  ): string {
    if (rows.length === 0) return "";

    const headers = Array.from(
      rows.reduce((set, row) => {
        Object.keys(row).forEach((key) => set.add(key));
        return set;
      }, new Set<string>()),
    );

    const escape = (value: string | number | boolean | null | undefined) => {
      const str = value === null || value === undefined ? "" : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ];

    return lines.join("\n");
  }

  static download(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
