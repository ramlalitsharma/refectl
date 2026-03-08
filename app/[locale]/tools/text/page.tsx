import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { TextUtilitiesTool } from "@/components/tools/TextUtilitiesTool";

export const metadata: Metadata = {
  title: "Text Utilities | Utilities",
  description: "Case conversion, duplicate removal, and word count tools.",
};

export default function TextUtilitiesPage() {
  return (
    <ToolShell title="Text Utilities" description="Convert case, remove duplicate lines, and measure word count.">
      <TextUtilitiesTool />
    </ToolShell>
  );
}

