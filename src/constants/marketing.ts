import { ReachableStatus, SignalTone } from "@/constants/validation";

export const FeatureKey = {
  SYNTAX: "syntax",
  MX: "mx",
  SMTP: "smtp",
  PROFILING: "profiling",
  LISTS: "lists",
} as const;

export type FeatureKey = (typeof FeatureKey)[keyof typeof FeatureKey];

export const HERO_TRUST_POINTS = [
  "Syntax, MX & SMTP checks",
  "Self-hosted engine",
  "No emails sent",
] as const;

export const DEMO_SAMPLES = [
  {
    email: "maria@northwind.io",
    status: ReachableStatus.SAFE,
    score: 98,
    title: "This address accepts email",
    body: "The recipient's mail server confirmed the mailbox exists.",
    signals: [
      { key: "syntax", label: "Format", value: "Valid", tone: SignalTone.GOOD },
      { key: "mx", label: "Domain", value: "3 MX records", tone: SignalTone.GOOD },
      { key: "smtp", label: "Mailbox", value: "Exists", tone: SignalTone.GOOD },
      { key: "disposable", label: "Disposable", value: "No", tone: SignalTone.GOOD },
    ],
  },
  {
    email: "info@catchall-store.com",
    status: ReachableStatus.RISKY,
    score: 54,
    title: "Deliverable, with a catch",
    body: "The server accepts everything, so the mailbox can't be confirmed.",
    signals: [
      { key: "syntax", label: "Format", value: "Valid", tone: SignalTone.GOOD },
      { key: "mx", label: "Domain", value: "2 MX records", tone: SignalTone.GOOD },
      { key: "catch-all", label: "Catch-all", value: "Yes", tone: SignalTone.WARN },
      { key: "role", label: "Role account", value: "Yes", tone: SignalTone.WARN },
    ],
  },
  {
    email: "john.doe@gmial.com",
    status: ReachableStatus.INVALID,
    score: 4,
    title: "This address will bounce",
    body: "The domain has no mail server. Possible typo of gmail.com.",
    signals: [
      { key: "syntax", label: "Format", value: "Valid", tone: SignalTone.GOOD },
      { key: "mx", label: "Domain", value: "No mail server", tone: SignalTone.BAD },
      { key: "smtp", label: "Mailbox", value: "Not found", tone: SignalTone.BAD },
      { key: "disposable", label: "Disposable", value: "No", tone: SignalTone.GOOD },
    ],
  },
] as const;

export const LIVE_FEED = [
  { email: "ana@lumen.studio", status: ReachableStatus.SAFE },
  { email: "sales@brightpath.co", status: ReachableStatus.RISKY },
  { email: "temp8812@mailinator.com", status: ReachableStatus.INVALID },
  { email: "kofi@harbor.dev", status: ReachableStatus.SAFE },
  { email: "noreply@unknown-host.xyz", status: ReachableStatus.UNKNOWN },
  { email: "li.wei@orbitlabs.ai", status: ReachableStatus.SAFE },
  { email: "admin@quietpine.net", status: ReachableStatus.RISKY },
  { email: "sam@yaho.com", status: ReachableStatus.INVALID },
  { email: "priya@fernhill.io", status: ReachableStatus.SAFE },
  { email: "hello@tidewater.shop", status: ReachableStatus.SAFE },
] as const;

export const FEATURES = [
  {
    key: FeatureKey.SYNTAX,
    tab: "Format check",
    title: "Catch typos before they cost you",
    body: "Every address is parsed against RFC rules. Malformed input, stray spaces and impossible characters are rejected instantly — before any network call.",
    points: ["RFC 5322 parsing", "Username & domain split", "Instant, no network"],
  },
  {
    key: FeatureKey.MX,
    tab: "Domain check",
    title: "Make sure the domain can receive mail",
    body: "We resolve MX records for the domain. No mail server, a null MX, or unresolvable hosts mean the address can never receive a message.",
    points: ["MX record lookup", "Null-MX detection", "Provider fingerprinting"],
  },
  {
    key: FeatureKey.SMTP,
    tab: "Delivery check",
    title: "Ask the mailbox directly",
    body: "An SMTP handshake confirms whether the mailbox exists — without sending a single email. Full inboxes and disabled accounts are flagged too.",
    points: ["Mailbox existence", "Full inbox & disabled", "No email ever sent"],
  },
  {
    key: FeatureKey.PROFILING,
    tab: "Email profiling",
    title: "Know who's behind the address",
    body: "Spot disposable providers, shared role inboxes like info@ or sales@, and catch-all domains that accept everything.",
    points: ["Disposable detection", "Role accounts", "Catch-all domains"],
  },
  {
    key: FeatureKey.LISTS,
    tab: "Mailing lists",
    title: "Clean an entire list in one go",
    body: "Paste or upload thousands of addresses. Jobs run in the background on a queue, and you can export only the clean ones.",
    points: ["Paste or CSV upload", "Live progress", "Filtered CSV export"],
  },
] as const;

export const LIST_STATS = [
  { value: "2–3%", label: "of signups contain spelling mistakes" },
  { value: "3–4%", label: "are made up on the spot" },
  { value: "~2%", label: "are spam signups with fake addresses" },
  { value: "~1%", label: "use temporary or catch-all inboxes" },
] as const;

export const USE_CASES = [
  {
    key: "marketing",
    title: "Email marketing",
    body: "Stop sending to addresses that don't exist. Lower bounce rates protect your sender reputation and keep you out of spam folders.",
  },
  {
    key: "signups",
    title: "Bot signups",
    body: "Check addresses at registration so fake and mistyped accounts never reach your database.",
  },
  {
    key: "fraud",
    title: "Fraud prevention",
    body: "Flag disposable inboxes used to farm free trials, promo codes and multiple accounts.",
  },
] as const;

export const PIPELINE_STEPS = [
  { key: "app", title: "Valimail", body: "Authenticated dashboard & API" },
  { key: "queue", title: "RabbitMQ", body: "Throttled verification queue" },
  { key: "engine", title: "Reacher", body: "SMTP, MX & syntax engine" },
  { key: "store", title: "Postgres", body: "Jobs & results history" },
] as const;

export const FAQS = [
  {
    q: "How does email validation work?",
    a: "We check the address format, look up the domain's mail servers, then open an SMTP conversation with the server to ask if the mailbox exists. No email is ever sent.",
  },
  {
    q: "What do Safe, Risky, Invalid and Unknown mean?",
    a: "Safe addresses accept mail. Risky ones exist but carry a catch: catch-all domains, role inboxes or disposable providers. Invalid addresses will bounce. Unknown means the server didn't give a clear answer.",
  },
  {
    q: "How many emails can I validate at once?",
    a: "Single checks are instant. Lists can hold up to 10,000 addresses per job and are processed in the background while you watch progress.",
  },
  {
    q: "Is my data kept private?",
    a: "Validation runs on a self-hosted engine. Your lists never pass through a third-party verification vendor.",
  },
  {
    q: "Can I export the results?",
    a: "Yes. Export every row or only a filtered set, such as the safe addresses, as CSV.",
  },
] as const;
