import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#d8f3ef_0%,_#f1f5f9_45%,_#e2e8f0_100%)] text-slate-900">
      <SiteHeader />
      {children}
    </div>
  );
}
