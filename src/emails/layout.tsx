import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { Brand } from "@/constants/brand";
import { MailAddress } from "@/constants/mail";

const body = {
  backgroundColor: "#f4f4f5",
  fontFamily: "Geist, Helvetica, Arial, sans-serif",
  margin: "0",
  padding: "32px 12px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "520px",
  padding: "32px 28px",
};

const wordmark = {
  color: "#18181b",
  fontSize: "18px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  margin: "0 0 24px",
};

const footer = {
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
};

export function EmailLayout(props: {
  preview: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{props.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={wordmark}>{Brand.NAME}</Text>
          {props.children}
          <Hr style={{ borderColor: "#e4e4e7", margin: "28px 0 16px" }} />
          <Section>
            <Text style={footer}>{props.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function SupportFooter() {
  return (
    <>
      Questions about this payment? Reply to this email and it reaches{" "}
      {MailAddress.SUPPORT}.
    </>
  );
}

export function NoReplyFooter() {
  return (
    <>
      This mailbox is not monitored. For a billing dispute, write to {MailAddress.SUPPORT}.
    </>
  );
}
