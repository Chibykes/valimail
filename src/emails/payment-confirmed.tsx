import { Button, Text } from "@react-email/components";
import { EmailLayout, SupportFooter } from "@/emails/layout";

const text = {
  color: "#18181b",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
};

const muted = {
  color: "#52525b",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 8px",
};

const button = {
  backgroundColor: "#4338ca",
  borderRadius: "999px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "12px 20px",
  textDecoration: "none",
};

export type PaymentConfirmedProps = {
  planName: string;
  amount: string;
  credits: number;
  balance: number;
  billingUrl?: string;
};

const preview: PaymentConfirmedProps = {
  planName: "Starter",
  amount: "$5.00",
  credits: 1_000,
  balance: 1_000,
  billingUrl: "https://valimail.dscrdbots.cc/dashboard/billing",
};

export default function PaymentConfirmedEmail(input: Partial<PaymentConfirmedProps> = {}) {
  const props = { ...preview, ...input };
  const credits = props.credits.toLocaleString("en-US");
  const balance = props.balance.toLocaleString("en-US");
  return (
    <EmailLayout
      preview={`${credits} Valimail credits are on your account.`}
      footer={<SupportFooter />}
    >
      <Text style={text}>Your {props.planName} pack is paid.</Text>
      <Text style={muted}>
        {props.amount} added {credits} credits. Your balance is {balance}.
      </Text>
      <Text style={muted}>Reply if the credits are missing.</Text>
      {props.billingUrl ? (
        <Button href={props.billingUrl} style={button}>
          View billing
        </Button>
      ) : null}
    </EmailLayout>
  );
}

PaymentConfirmedEmail.PreviewProps = preview;
