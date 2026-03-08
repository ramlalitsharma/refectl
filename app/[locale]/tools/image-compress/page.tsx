import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { ImageConverterTool } from "@/components/tools/ImageConverterTool";

export const metadata: Metadata = {
  title: "Image Compress | Utilities",
  description: "Compress images using adjustable quality and size.",
};

export default function ImageCompressPage() {
  return (
    <ToolShell title="Image Compress" description="Compress images locally by lowering quality and dimensions.">
      <ImageConverterTool />
    </ToolShell>
  );
}

