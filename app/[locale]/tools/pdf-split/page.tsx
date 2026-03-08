import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";

export const metadata: Metadata = {
  title: "PDF Split | Utilities",
  description: "Split a PDF into multiple files.",
};

export default function PdfSplitPage() {
  return (
    <ToolShell title="PDF Split" description="Split PDFs by page ranges or single pages.">
      <PlaceholderTool title="PDF Split" note="Enable a PDF processing engine (server worker) to split files." />
    </ToolShell>
  );
}

