import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";

export const metadata: Metadata = {
  title: "URL to PDF | Utilities",
  description: "Convert a URL to PDF for archiving.",
};

export default function UrlToPdfPage() {
  return (
    <ToolShell title="URL to PDF" description="Archive any web page as a PDF.">
      <PlaceholderTool title="URL to PDF" note="Enable a server renderer (headless browser) to capture URLs." />
    </ToolShell>
  );
}

