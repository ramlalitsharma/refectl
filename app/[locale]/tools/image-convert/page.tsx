import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { ImageConverterTool } from "@/components/tools/ImageConverterTool";

export const metadata: Metadata = {
  title: "Image Convert & Resize | Utilities",
  description: "Convert, resize, and compress images locally in your browser.",
};

export default function ImageConvertPage() {
  return (
    <ToolShell title="Image Convert & Resize" description="Convert and resize images locally with adjustable quality.">
      <ImageConverterTool />
    </ToolShell>
  );
}

