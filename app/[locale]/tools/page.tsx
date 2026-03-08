import { Metadata } from "next";
import { Link } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Utilities Hub | Refectl",
  description: "Professional toolkits for PDF, images, OCR, text, and productivity.",
};

const tools = [
  { href: "/tools/image-to-pdf", label: "Image to PDF", group: "PDF" },
  { href: "/tools/pdf-merge", label: "PDF Merge", group: "PDF" },
  { href: "/tools/pdf-split", label: "PDF Split", group: "PDF" },
  { href: "/tools/pdf-compress", label: "PDF Compress", group: "PDF" },
  { href: "/tools/pdf-to-word", label: "PDF to Word", group: "PDF" },
  { href: "/tools/pdf-to-excel", label: "PDF to Excel", group: "PDF" },
  { href: "/tools/url-to-pdf", label: "URL to PDF", group: "PDF" },
  { href: "/tools/image-convert", label: "Image Convert/Resize", group: "Image" },
  { href: "/tools/image-compress", label: "Image Compress", group: "Image" },
  { href: "/tools/ocr", label: "OCR (Image/PDF → Text)", group: "OCR" },
  { href: "/tools/text", label: "Text Utilities", group: "Text" },
  { href: "/tools/qr", label: "QR Generator", group: "Utility" },
  { href: "/tools/password", label: "Password Generator", group: "Utility" },
  { href: "/tools/timestamp", label: "Timestamp Converter", group: "Utility" },
  { href: "/tools/unit", label: "Unit Converter", group: "Utility" },
  { href: "/tools/calculator", label: "Commercial Calculator", group: "Calculators" },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">Utilities</h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mt-3">
            Professional toolkits and calculators. Privacy-first, fast, and built for global users.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-2xl border border-slate-200 dark:border-white/10 p-6 bg-white dark:bg-elite-surface hover:border-elite-accent-cyan transition-colors"
            >
              <div className="text-[11px] uppercase tracking-widest text-slate-400">{tool.group}</div>
              <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">{tool.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

