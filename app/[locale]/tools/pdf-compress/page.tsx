import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PlaceholderTool } from "@/components/tools/PlaceholderTool";

export const metadata: Metadata = {
  title: "Compress PDF Online Free – Reduce PDF File Size Securely",
  description: "Shrink your PDF documents without losing quality. 100% private, client-side PDF compression. No file uploads, maximum security.",
  keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "pdf compressor online", "free pdf tools"],
  openGraph: {
    title: "Secure PDF Compressor – 100% Private",
    description: "Reduce PDF file size instantly in your browser. No files are ever uploaded.",
    type: "website",
  }
};

export default function PdfCompressPage() {
  return (
    <ToolShell title="PDF Compress" description="Shrink your PDF files for easier sharing and storage while maintaining professional document quality.">
      <PlaceholderTool title="PDF Compress" note="Our advanced client-side compression engine is currently being optimized for maximum quality retention." />

      <div className="mt-16 space-y-12 max-w-4xl mx-auto">
        <section className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/10 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">How to Compress PDF Files Online</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Select PDF", desc: "Choose the PDF file you want to compress from your device." },
              { step: "2", title: "Process", desc: "Our engine optimizes images and fonts internally to reduce size." },
              { step: "3", title: "High-Quality Save", desc: "Download your compressed file instantly without any data leaving your device." }
            ].map(s => (
              <div key={s.step} className="space-y-2">
                <div className="text-3xl font-black text-blue-500/20">{s.step}</div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ToolShell>
  );
}

