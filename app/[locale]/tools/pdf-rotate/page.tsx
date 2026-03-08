
import { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import { PdfMergeTool } from "@/components/tools/PdfMergeTool";

export const metadata: Metadata = {
    title: "Rotate PDF Online Free – Fix PDF Orientation Instantly",
    description: "Rotate PDF pages permanently for free. Secure, fast, and 100% browser-based. No file uploads, maximum privacy.",
    keywords: ["rotate pdf", "fix pdf orientation", "rotate pdf online", "permanently rotate pdf", "free pdf rotator"],
    openGraph: {
        title: "Rotate PDF Online Free – 100% Private",
        description: "Fix PDF orientation instantly. Fast, secure, and stays on your device.",
        type: "website",
    }
};

export default function RotatePdfPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Refectl Rotate PDF",
        "description": "Rotate PDF pages in any direction, 100% in-browser processing.",
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
                title="Rotate PDF Online"
                description="Permanently fix the orientation of your PDF pages. Fast, secure, and 100% browser-based."
            >
                <PdfMergeTool initialMode="rotate" />

                <div className="mt-24 space-y-20 max-w-5xl mx-auto pb-20">
                    <section className="space-y-10">
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">How to Rotate PDF Online Free</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Correct the orientation of any PDF page in seconds.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { step: "01", title: "Select PDF", desc: "Upload the PDF document you need to rotate." },
                                { step: "02", title: "Rotate Pages", desc: "Use the rotation icon on individual page cards to find the perfect orientation." },
                                { step: "03", title: "Save & Download", desc: "Generate your corrected PDF and save it instantly to your device." }
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
