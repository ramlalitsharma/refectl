import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { TimestampConverterTool } from "@/components/tools/TimestampConverterTool";

export const metadata: Metadata = {
  title: "Timestamp Converter | Utilities",
  description: "Convert timestamps to human-readable dates and back.",
};

export default function TimestampPage() {
  return (
    <ToolShell title="Timestamp Converter" description="Convert between timestamps and ISO dates.">
      <TimestampConverterTool />
    </ToolShell>
  );
}

