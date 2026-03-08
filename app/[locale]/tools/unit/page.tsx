import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { UnitConverterTool } from "@/components/tools/UnitConverterTool";

export const metadata: Metadata = {
  title: "Unit Converter | Utilities",
  description: "Convert between common units quickly.",
};

export default function UnitPage() {
  return (
    <ToolShell title="Unit Converter" description="Convert distance and temperature units.">
      <UnitConverterTool />
    </ToolShell>
  );
}

