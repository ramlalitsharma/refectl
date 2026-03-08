import { Metadata } from "next";
import { ToolShell } from "@/components/tools/ToolShell";
import { PdfMergeTool } from "@/components/tools/PdfMergeTool";

export const metadata: Metadata = {
  title: "Merge PDF Online Free – Combine & Edit PDF Files Instantly",
  description: "Merge multiple PDF files into one document quickly and securely directly in your browser. No uploads, 100% private, world-class speed with professional editing tools.",
  keywords: ["merge pdf", "combine pdf", "join pdf", "free pdf merger", "pdf editor online", "edit pdf", "watermark pdf", "client-side pdf tools"],
  openGraph: {
    title: "World's Fastest Private PDF Merger & Editor",
    description: "Combine and edit PDFs 100% in your browser. Your files never leave your device.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge PDF Online Free – 100% Private",
    description: "Professional PDF tools architecture. No uploads. No servers.",
  }
};

export default function PdfMergePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Refectl PDF Tools",
    "description": "Professional-grade, 100% browser-based PDF merging and editing tool.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Merge multiple PDFs",
      "Rotate pages",
      "Duplicate pages",
      "Delete pages",
      "Add text annotations",
      "DIagonal watermarking",
      "Client-side processing"
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is it safe to merge PDF files online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our tool is 100% secure. Unlike other platforms, we process your files entirely in your browser. Your documents never leave your computer, ensuring complete privacy."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a limit on the number of PDFs I can combine?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, you can merge as many files as you need. Since the processing happens on your device, it's only limited by your hardware's memory."
        }
      },
      {
        "@type": "Question",
        "name": "Can I edit the PDFs before merging them?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. You can rotate, reorder, delete pages, and even add text annotations or watermarks before generating the final combined PDF."
        }
      },
      {
        "@type": "Question",
        "name": "How fast is the PDF merging process?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It is near-instant. Because there is no uploading or downloading to a server, the merge happens as fast as your browser can process the data, usually in less than a second."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <ToolShell
        title="Professional PDF Merger & Editor"
        description="The world's fastest and most private way to combine documents. Everything happens on your device — no files are ever uploaded."
      >
        <PdfMergeTool />

        {/* SEO Marketing Sections */}
        <div className="mt-24 space-y-20 max-w-5xl mx-auto pb-20">

          {/* How It Works */}
          <section className="space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">How to Combine PDF Files Online</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Merge multiple PDFs into one professional document in three simple steps.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Upload Files", desc: "Select and upload the PDF documents or images you want to join together." },
                { step: "02", title: "Organize & Edit", desc: "Drag to reorder, rotate pages, or use our editor to add text and watermarks." },
                { step: "03", title: "Merge & Download", desc: "Click 'Generate PDF' to instantly create and save your combined document." }
              ].map(item => (
                <div key={item.step} className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-blue-500/30 transition-all group">
                  <div className="text-5xl font-black text-blue-500/10 group-hover:text-blue-500/20 transition-colors mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Feature Grid */}
          <section className="bg-slate-950 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-black leading-tight">Fast. Private.<br /><span className="text-blue-500">Uncompromising.</span></h2>
                <p className="text-slate-400 text-lg">Our PDF merger is built on a next-generation architecture that treats your privacy as the priority. No servers, no data collection, just pure performance.</p>
                <ul className="space-y-4">
                  {[
                    "100% Client-Side Processing",
                    "No File Uploads Required",
                    "Military-Grade Browser Security",
                    "All-in-One Editor Included"
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 font-bold text-sm">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="text-blue-500 font-black text-2xl mb-1">0ms</div>
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-50">Upload Time</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="text-emerald-500 font-black text-2xl mb-1">100%</div>
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-50">Private</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="text-indigo-500 font-black text-2xl mb-1">HD</div>
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-50">Quality Rendering</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="text-rose-500 font-black text-2xl mb-1">$0</div>
                    <div className="text-[10px] uppercase tracking-widest font-black opacity-50">Forever Free</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqData.mainEntity.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 shadow-sm">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-start gap-3">
                    <span className="text-blue-500 mt-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
                    </span>
                    {faq.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-7">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </ToolShell>
    </>
  );
}
