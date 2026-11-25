export class InsufficientCreditsError extends Error {
  readonly balance: number;
  readonly required: number;

  constructor(balance: number, required: number) {
    super(
      `Not enough credits. This needs ${required.toLocaleString("en-US")} and the balance is ${balance.toLocaleString("en-US")}.`,
    );
    this.name = "InsufficientCreditsError";
    this.balance = balance;
    this.required = required;
  }
}
