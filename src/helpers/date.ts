const DAY_MS = 86_400_000;

export class DateHelper {
  static groupLabel(iso: string, now = new Date()): string {
    const days = this.daysAgo(iso, now);
    if (days < 7) return "This week";
    if (days < 30) return "This month";
    return "Earlier";
  }

  static relativeDay(iso: string, now = new Date()): string {
    const date = new Date(iso);
    const days = this.daysAgo(iso, now);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) {
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
  }

  static time(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  static groupBy<T>(items: T[], getIso: (item: T) => string) {
    const groups = new Map<string, T[]>();
    for (const item of items) {
      const label = this.groupLabel(getIso(item));
      groups.set(label, [...(groups.get(label) ?? []), item]);
    }
    return Array.from(groups, ([label, entries]) => ({ label, entries }));
  }

  private static daysAgo(iso: string, now: Date): number {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const date = new Date(iso);
    date.setHours(0, 0, 0, 0);
    return Math.max(0, Math.round((startOfToday.getTime() - date.getTime()) / DAY_MS));
  }
}
