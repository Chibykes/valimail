import { BalanceForm } from "@/components/admin/balance-form";
import { AdminRepository } from "@/repositories/admin";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const users = await AdminRepository.listUsers(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Adjustments are stored on the credit ledger and cannot take a balance below 0.
          </p>
        </div>
        <form className="flex w-full items-center gap-2 sm:w-auto">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand-300 sm:w-56"
          />
        </form>
      </div>
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No users match.</p>
      ) : (
        <ul className="divide-y divide-border/70 rounded-2xl border border-border">
          {users.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.creditBalance.toLocaleString("en-US")} credits · joined{" "}
                  {user.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <BalanceForm userId={user.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
