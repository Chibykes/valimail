import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { LiveFeed } from "@/components/marketing/live-feed";
import { PipelineSection } from "@/components/marketing/pipeline-section";
import { UseCasesSection } from "@/components/marketing/use-cases-section";

export default function MarketingPage() {
  return (
    <main>
      <HeroSection />
      <LiveFeed />
      <FeaturesSection />
      <UseCasesSection />
      <PipelineSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
