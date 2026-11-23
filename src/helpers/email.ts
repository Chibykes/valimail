export class EmailHelper {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  static normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  static isValidSyntax(email: string): boolean {
    const normalized = this.normalize(email);
    if (!normalized || normalized.length > 254) return false;
    return this.EMAIL_REGEX.test(normalized);
  }

  static parseList(raw: string): string[] {
    const parts = raw
      .split(/[\n,;\s]+/)
      .map((part) => this.normalize(part))
      .filter(Boolean);

    return Array.from(new Set(parts));
  }

  static filterValid(emails: string[]): {
    valid: string[];
    invalid: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const email of emails) {
      if (this.isValidSyntax(email)) valid.push(email);
      else invalid.push(email);
    }

    return { valid, invalid };
  }
}
