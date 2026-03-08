import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { QrGeneratorTool } from "@/components/tools/QrGeneratorTool";

export const metadata: Metadata = {
  title: "QR Generator | Utilities",
  description: "Generate QR codes instantly.",
};

export default function QrPage() {
  return (
    <ToolShell title="QR Generator" description="Create QR codes for any URL or text.">
      <QrGeneratorTool />
    </ToolShell>
  );
}

