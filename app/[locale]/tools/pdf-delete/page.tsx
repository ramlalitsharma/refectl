
import { Metadata } from "next";
import ToolShell from "@/components/tools/ToolShell";
import { PdfMergeTool } from "@/components/tools/PdfMergeTool";

export const metadata: Metadata = {
    title: "Delete PDF Pages Online Free – Remove Pages from PDF Instantly",
    description: "Easily delete and remove unwanted pages from your PDF documents for free. 100% private, no uploads, works entirely in your browser.",
    keywords: ["delete pdf pages", "remove pages from pdf", "extract pdf pages", "pdf page remover", "free pdf tools"],
    openGraph: {
        title: "Delete PDF Pages Online Free – 100% Private",
        description: "Remove unwanted pages from any PDF instantly. No file uploads required.",
        type: "website",
    }
};

export default function DeletePdfPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Refectl Delete PDF Pages",
        "description": "Remove unwanted pages from PDF files with ease, 100% in-browser.",
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
                title="Delete PDF Pages"
                description="Select and remove any page from your PDF document instantly. Your files never leave your device."
            >
                <PdfMergeTool initialMode="delete" />

                <div className="mt-16 space-y-12 max-w-4xl mx-auto">
                    {/* How to Section */}
                    <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-100 dark:border-white/10 shadow-sm">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">How to Delete PDF Pages Online</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { step: "1", title: "Upload", desc: "Select and upload your PDF file to the secure browser-based tool." },
                                { step: "2", title: "Select", desc: "Hover over pages and click 'Delete' or select multiple for bulk removal." },
                                { step: "3", title: "Download", desc: "Hit 'Download' to save your new trimmed PDF instantly." }
                            ].map(s => (
                                <div key={s.step} className="space-y-2">
                                    <div className="text-3xl font-black text-blue-500/20">{s.step}</div>
                                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{s.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white text-center">Frequently Asked Questions</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { q: "Is it free to delete PDF pages?", a: "Yes, our tool is 100% free with no hidden costs or watermarks." },
                                { q: "Are my files safe?", a: "Your files never leave your device. All processing happens 100% in your browser." },
                                { q: "Do I need to register?", a: "No registration is required. You can start deleting pages immediately." },
                                { q: "Does it work on mobile?", a: "Yes, our responsive design works perfectly on iPhone, Android, and tablets." }
                            ].map(faq => (
                                <div key={faq.q} className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/10">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">{faq.q}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ToolShell>
        </>
    );
}
