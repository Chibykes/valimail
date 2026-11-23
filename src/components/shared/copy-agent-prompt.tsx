"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AGENT_INTEGRATION_PROMPT } from "@/constants/api-docs";

export function CopyAgentPrompt({
  variant = "outline",
}: {
  variant?: "outline" | "default" | "secondary";
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(AGENT_INTEGRATION_PROMPT);
      setCopied(true);
      toast.success("Agent prompt copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the prompt");
    }
  }

  return (
    <Button type="button" variant={variant} onClick={() => void onCopy()}>
      {copied ? <Check /> : <Copy />}
      Copy prompt for agents
    </Button>
  );
}
