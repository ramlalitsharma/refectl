import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { ImageToPdfTool } from "@/components/tools/ImageToPdfTool";

export const metadata: Metadata = {
  title: "Convert Image to PDF Online Free – JPG, PNG to PDF Instantly",
  description: "Convert JPG, PNG, and other images to PDF in seconds. 100% private, browser-based conversion with professional print layout.",
  keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert images to pdf", "free image to pdf converter"],
  openGraph: {
    title: "Instant Image to PDF Converter – 100% Private",
    description: "Convert any image to a professional PDF document. No uploads, stays on your device.",
    type: "website",
  }
};

export default function ImageToPdfPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Refectl Image to PDF",
    "description": "Convert images to PDF documents securely in your browser.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolShell
        title="Image to PDF Converter"
        description="Convert your JPG, PNG, or TIFF images into a professional PDF document using our secure, client-side tool."
      >
        <ImageToPdfTool />

        <div className="mt-16 space-y-12 max-w-4xl mx-auto">
          <section className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/10 shadow-sm">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">How to Convert Images to PDF</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Upload", desc: "Select the images (JPG, PNG, etc.) you want to convert." },
                { step: "2", title: "Adjust", desc: "Our tool automatically prepares the image for a perfect PDF fit." },
                { step: "3", title: "Download", desc: "Save your new PDF document instantly without any server uploads." }
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
    </>
  );
}

