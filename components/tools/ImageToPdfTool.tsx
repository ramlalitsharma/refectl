'use client';

import { useState } from 'react';

export function ImageToPdfTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('image');

  const onFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, '') || 'image');
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const printPdf = () => {
    if (!imageSrc) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>${fileName}.pdf</title>
          <style>
            body{margin:0;display:flex;align-items:center;justify-content:center;background:#fff}
            img{max-width:100%;max-height:100vh}
          </style>
        </head>
        <body>
          <img src="${imageSrc}" />
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="block w-full text-sm text-slate-600 dark:text-slate-300"
        />
        <p className="text-xs text-slate-500 mt-2">Select an image. We’ll open a print view so you can save as PDF.</p>
      </div>
      {imageSrc && (
        <div className="space-y-4">
          <img src={imageSrc} alt="Preview" className="rounded-2xl max-h-[420px] object-contain mx-auto" />
          <button
            type="button"
            onClick={printPdf}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-elite-accent-cyan text-black font-black uppercase text-xs tracking-[0.25em]"
          >
            Print to PDF
          </button>
        </div>
      )}
    </div>
  );
}

