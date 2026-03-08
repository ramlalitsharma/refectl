import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";

export const metadata: Metadata = {
  title: "PDF to Excel | Utilities",
  description: "Convert PDF tables to Excel.",
};

export default function PdfToExcelPage() {
  return (
    <ToolShell title="PDF to Excel" description="Convert PDF tables into Excel spreadsheets.">
      <PlaceholderTool title="PDF to Excel" note="Enable a PDF conversion engine (server worker) to convert files." />
    </ToolShell>
  );
}

