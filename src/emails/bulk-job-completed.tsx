import { Button, Text } from "@react-email/components";
import { EmailLayout, NoReplyFooter } from "@/emails/layout";

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

export type BulkJobCompletedProps = {
  listName: string;
  total: number;
  safe: number;
  risky: number;
  invalid: number;
  unknown: number;
  jobUrl?: string;
};

const preview: BulkJobCompletedProps = {
  listName: "November leads",
  total: 1_000,
  safe: 820,
  risky: 40,
  invalid: 90,
  unknown: 50,
  jobUrl: "https://valimail.dscrdbots.cc/dashboard/lists/example",
};

export default function BulkJobCompletedEmail(input: Partial<BulkJobCompletedProps> = {}) {
  const props = { ...preview, ...input };
  return (
    <EmailLayout
      preview={`${props.listName} is finished.`}
      footer={<NoReplyFooter />}
    >
      <Text style={text}>{props.listName} is finished.</Text>
      <Text style={muted}>{props.total.toLocaleString("en-US")} addresses.</Text>
      <Text style={muted}>Safe {props.safe.toLocaleString("en-US")}</Text>
      <Text style={muted}>Risky {props.risky.toLocaleString("en-US")}</Text>
      <Text style={muted}>Invalid {props.invalid.toLocaleString("en-US")}</Text>
      <Text style={muted}>Unknown {props.unknown.toLocaleString("en-US")}</Text>
      {props.jobUrl ? (
        <Button href={props.jobUrl} style={button}>
          Open the list
        </Button>
      ) : null}
    </EmailLayout>
  );
}

BulkJobCompletedEmail.PreviewProps = preview;
