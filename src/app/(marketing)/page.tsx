import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppRoutes } from "@/constants/routes";

const useCases = [
  {
    title: "List hygiene",
    body: "Clean signup lists before campaigns so bounce rates stay low.",
  },
  {
    title: "Signup gates",
    body: "Reject disposable and undeliverable addresses at registration.",
  },
  {
    title: "CRM sync",
    body: "Bulk-check CRM exports and keep only reachable contacts.",
  },
];

const faqs = [
  {
    q: "What does Valimail check?",
    a: "Syntax, MX records, SMTP deliverability signals, and misc flags like disposable or role accounts.",
  },
  {
    q: "Do I need Reacher running?",
    a: "Yes. The Next.js BFF calls your Reacher instance; the browser never talks to Reacher directly.",
  },
  {
    q: "Is billing included?",
    a: "No. User API keys and billing are out of scope for this build.",
  },
];

export default function MarketingPage() {
  return (
    <main>
      <section className="relative overflow-hidden px-6 pb-20 pt-10 md:px-10 md:pb-28 md:pt-16">
        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl motion-safe:animate-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-10 h-56 w-56 rounded-full bg-slate-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-5xl">
          <p className="mb-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-teal-800 md:text-6xl">
            Valimail
          </p>
          <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-slate-800 md:text-4xl">
            Know which emails are safe to send before you hit send.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600 md:text-lg">
            Single checks and bulk lists with syntax, MX, and SMTP insight —
            authenticated workspace, Reacher under the hood.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Suspense fallback={null}>
              <Show when="signed-out">
                <Button asChild className="bg-teal-700 hover:bg-teal-800">
                  <Link href={AppRoutes.SIGN_UP}>Sign up</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={AppRoutes.SIGN_IN}>Sign in</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button asChild className="bg-teal-700 hover:bg-teal-800">
                  <Link href={AppRoutes.DASHBOARD_SINGLE}>Open dashboard</Link>
                </Button>
              </Show>
            </Suspense>
          </div>

          <div className="mt-10 translate-y-0 opacity-100 transition duration-700 ease-out motion-safe:animate-[fade-up_0.8s_ease-out]">
            <HeroDemo />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white/50 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-slate-900">
            What it does
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Valimail wraps Reacher behind your authenticated API. Validate one
            address or upload a list, then read clear safe / risky / invalid /
            unknown results.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Syntax", "MX", "SMTP"].map((label, index) => (
              <Card
                key={label}
                className="border-slate-200/80 bg-white/80 transition hover:-translate-y-1 hover:shadow-md"
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <CardHeader>
                  <CardTitle className="text-teal-800">{label}</CardTitle>
                  <CardDescription>
                    {label === "Syntax" &&
                      "Catch malformed addresses before deeper checks."}
                    {label === "MX" &&
                      "Confirm the domain can receive mail."}
                    {label === "SMTP" &&
                      "Probe deliverability and catch-all signals."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-slate-900">
            Use cases
          </h2>
          <p className="mt-3 text-slate-600">
            Built for operators who need trustable reachability data.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {useCases.map((item) => (
              <Card key={item.title} className="border-slate-200 bg-white/70">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-slate-900 px-6 py-16 text-slate-100 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl">
            FAQ
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <Card
                key={item.q}
                className="border-slate-700 bg-slate-800/60 text-slate-100"
              >
                <CardHeader>
                  <CardTitle className="text-base text-teal-200">
                    {item.q}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300">
                  {item.a}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-slate-500 md:px-10">
        Valimail · Email validation workspace
      </footer>
    </main>
  );
}
