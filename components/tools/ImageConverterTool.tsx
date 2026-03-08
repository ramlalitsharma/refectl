'use client';

import { useState } from 'react';

type Format = 'image/jpeg' | 'image/png' | 'image/webp';

export function ImageConverterTool() {
  const [src, setSrc] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>('image/jpeg');
  const [quality, setQuality] = useState(0.85);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const convert = async () => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    await img.decode();
    const targetW = width || img.width;
    const targetH = height || img.height;
    const canvas = document.createElement('canvas');
    canvas.width = Number(targetW);
    canvas.height = Number(targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
  };

  return (
    <div className="space-y-6">
      <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
      {src && <img src={src} alt="Preview" className="rounded-2xl max-h-[320px] object-contain" />}
      <div className="grid md:grid-cols-3 gap-4">
        <label className="text-sm">
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value as Format)} className="w-full mt-1 p-2 rounded-lg border">
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
        </label>
        <label className="text-sm">
          Quality
          <input type="number" step="0.05" min="0.2" max="1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full mt-1 p-2 rounded-lg border" />
        </label>
        <label className="text-sm">
          Width
          <input type="number" value={width} onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')} className="w-full mt-1 p-2 rounded-lg border" />
        </label>
        <label className="text-sm">
          Height
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')} className="w-full mt-1 p-2 rounded-lg border" />
        </label>
      </div>
      <button type="button" onClick={convert} className="px-6 py-3 rounded-xl bg-elite-accent-cyan text-black font-black uppercase text-xs tracking-[0.25em]">
        Convert
      </button>
      {downloadUrl && (
        <a href={downloadUrl} download={`converted.${format.split('/')[1]}`} className="text-elite-accent-cyan font-bold">
          Download Converted Image
        </a>
      )}
    </div>
  );
}

