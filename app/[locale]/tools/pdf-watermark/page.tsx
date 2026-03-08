
import { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import { PdfMergeTool } from "@/components/tools/PdfMergeTool";

export const metadata: Metadata = {
    title: "Watermark PDF Online Free – Add Text Watermarks to PDF",
    description: "Securely add professional text watermarks to your PDF documents. 100% private, browser-based, no uploads required.",
    keywords: ["watermark pdf", "add watermark to pdf", "pdf watermark online", "secure pdf branding", "watermark pdf free"],
    openGraph: {
        title: "Watermark PDF Online Free – 100% Private",
        description: "Add professional branding to your PDFs instantly. No file uploads.",
        type: "website",
    }
};

export default function WatermarkPdfPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Refectl PDF Watermark",
        "description": "Add text watermarks to PDF files securely with browser-only processing.",
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
                title="Watermark PDF"
                description="Brand your documents with custom text watermarks. Maximum privacy, 100% on-device processing."
            >
                <PdfMergeTool initialMode="watermark" />

                <div className="mt-24 space-y-20 max-w-5xl mx-auto pb-20">
                    <section className="space-y-10">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">How to Watermark PDF Online</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Add secure text branding to your documents in seconds.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: "01", title: "Upload PDF", desc: "Select the PDF file you wish to watermark securely." },
                                { step: "02", title: "Add Text", desc: "Enter your custom watermark text in the floating toolbar." },
                                { step: "03", title: "Export Branded PDF", desc: "Apply the watermark globally and download your protected document." }
                            ].map(item => (
                                <div key={item.step} className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-blue-500/30 transition-all group">
                                    <div className="text-5xl font-black text-blue-500/10 group-hover:text-blue-500/20 transition-colors mb-4">{item.step}</div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </ToolShell>
        </>
    );
}
