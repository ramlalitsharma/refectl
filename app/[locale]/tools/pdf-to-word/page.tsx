import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";

export const metadata: Metadata = {
  title: "PDF to Word | Utilities",
  description: "Convert PDF documents to Word.",
};

export default function PdfToWordPage() {
  return (
    <ToolShell title="PDF to Word" description="Convert PDFs to editable Word documents.">
      <PlaceholderTool title="PDF to Word" note="Enable a PDF conversion engine (server worker) to convert files." />
    </ToolShell>
  );
}

