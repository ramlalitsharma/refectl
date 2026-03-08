import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PasswordGeneratorTool } from "@/components/tools/PasswordGeneratorTool";

export const metadata: Metadata = {
  title: "Password Generator | Utilities",
  description: "Generate secure passwords instantly.",
};

export default function PasswordPage() {
  return (
    <ToolShell title="Password Generator" description="Generate strong passwords for secure accounts.">
      <PasswordGeneratorTool />
    </ToolShell>
  );
}

