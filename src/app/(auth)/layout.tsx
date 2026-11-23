import Link from "next/link";
import { AppRoutes } from "@/constants/routes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_#d8f3ef_0%,_#f1f5f9_50%,_#e2e8f0_100%)] px-4">
      <Link
        href={AppRoutes.HOME}
        className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-teal-800"
      >
        Valimail
      </Link>
      {children}
    </div>
  );
}
