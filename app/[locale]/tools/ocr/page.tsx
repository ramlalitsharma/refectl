import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";

export const metadata: Metadata = {
  title: "OCR (Image/PDF → Text) | Utilities",
  description: "Extract text from images and PDFs.",
};

export default function OcrPage() {
  return (
    <ToolShell title="OCR (Image/PDF → Text)" description="Extract text from images or PDFs.">
      <PlaceholderTool
        title="OCR Engine"
        note="Configure an OCR engine (Tesseract.js or server worker) to enable extraction."
      />
    </ToolShell>
  );
}

