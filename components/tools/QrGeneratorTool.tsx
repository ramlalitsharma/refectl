'use client';

import { useState } from 'react';

export function QrGeneratorTool() {
  const [text, setText] = useState('https://refectl.com');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(text)}`;

  return (
    <div className="space-y-6">
      <input
        className="w-full p-3 rounded-xl border"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter URL or text..."
      />
      <img src={qrUrl} alt="QR Code" className="rounded-2xl border" />
      <a href={qrUrl} download="qrcode.png" className="text-elite-accent-cyan font-bold">
        Download QR Code
      </a>
    </div>
  );
}

