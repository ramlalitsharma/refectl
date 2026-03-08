'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, degrees, StandardFonts, rgb } from 'pdf-lib';
import { createWorker } from 'tesseract.js';
import { FabricPdfEditor } from './FabricPdfEditor';
import JSZip from 'jszip';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Annotation {
    id: string;
    type: 'text' | 'rect' | 'path';
    text?: string;
    x: number;          // percentage 0-100
    y: number;          // percentage 0-100
    width?: number;     // percentage 0-100
    height?: number;    // percentage 0-100
    color: string;
    fontSize?: number;
}

interface MergePage {
    id: string;                  // unique id for this page slot
    fileId: string;
    fileName: string;
    fileColor: string;           // badge color for the source file
    srcIndex: number;            // 0-based page index in the source PDF
    thumbnail: string | null;
    rotation: 0 | 90 | 180 | 270;
    excluded: boolean;
    annotations: Annotation[];
}

interface SourceFile {
    id: string;
    name: string;
    arrayBuffer: ArrayBuffer;
    pageCount: number;
    color: string;
}

type MergeStatus = 'idle' | 'processing' | 'done' | 'error';
type ViewMode = 'xl' | 'lg' | 'md' | 'sm' | 'list';

// ─── Constants ──────────────────────────────────────────────────────────────

const FILE_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#f59e0b', '#06b6d4', '#ef4444',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

const hexToRgbVals = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
};

async function renderPage(buf: ArrayBuffer, pageIdx: number, scale = 0.4): Promise<string | null> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        }
        const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
        const page = await pdf.getPage(pageIdx + 1);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        return canvas.toDataURL('image/jpeg', 0.75);
    } catch (e) {
        console.error('PDF render error', e);
        return null;
    }
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

/**
 * Functional wrapper for FabricPdfEditor that handles its own high-res rendering.
 * Used in both Modal and Full-Editor modes.
 */
function HighResEditorWrapper({
    page,
    sources,
    onUpdate
}: {
    page: MergePage,
    sources: SourceFile[],
    onUpdate: (u: Partial<MergePage>) => void
}) {
    const [loading, setLoading] = useState(true);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState('');
    const [dims, setDims] = useState({ width: 0, height: 0 });
    const [renderedUrl, setRenderedUrl] = useState('');

    useEffect(() => {
        let isMounted = true;
        const renderToBlob = async () => {
            try {
                const src = sources.find(s => s.id === page.fileId);
                if (!src) return;

                const pdfjsLib = await import('pdfjs-dist');
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
                }

                const pdf = await pdfjsLib.getDocument({ data: src.arrayBuffer.slice(0) }).promise;
                const pdfPage = await pdf.getPage(page.srcIndex + 1);

                const rawVp = pdfPage.getViewport({ scale: 1 });
                const maxDim = 2048;
                let baseScale = 3.5;
                if (rawVp.width * baseScale > maxDim) baseScale = maxDim / rawVp.width;
                if (rawVp.height * baseScale > maxDim) baseScale = maxDim / rawVp.height;
                const vp = pdfPage.getViewport({ scale: baseScale });

                const canvas = document.createElement('canvas');
                canvas.width = vp.width;
                canvas.height = vp.height;
                const ctx = canvas.getContext('2d')!;
                await pdfPage.render({ canvasContext: ctx, viewport: vp }).promise;

                if (isMounted) {
                    setRenderedUrl(canvas.toDataURL());
                    setDims({ width: canvas.width, height: canvas.height });
                    setLoading(false);
                }
            } catch (err) {
                console.error("HighRes Render Error:", err);
                if (isMounted) setLoading(false);
            }
        };
        renderToBlob();
        return () => { isMounted = false; };
    }, [page, sources]);

    const runOcr = async () => {
        if (!renderedUrl || ocrLoading) return;
        setOcrLoading(true);
        try {
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(renderedUrl);
            setOcrResult(text);
            await worker.terminate();
        } catch (err) {
            console.error("OCR Error:", err);
        } finally {
            setOcrLoading(false);
        }
    };

    if (loading) return (
        <div className="w-full h-96 flex flex-col items-center justify-center text-white/50 animate-pulse gap-4 bg-slate-900/50 rounded-xl border border-white/5">
            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="font-bold tracking-widest text-[10px] uppercase text-slate-500">Preparing Canvas...</p>
        </div>
    );

    return (
        <div className="w-full overflow-hidden flex flex-col gap-6">
            <div className="flex items-center justify-center">
                <button
                    onClick={runOcr}
                    disabled={ocrLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 transition-all border border-indigo-400/30 font-sans"
                >
                    {ocrLoading ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" /></svg>
                            Scan to Text (OCR)
                        </>
                    )}
                </button>
            </div>

            {ocrResult && (
                <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">Extracted Text</span>
                        <button
                            onClick={() => { navigator.clipboard.writeText(ocrResult); alert('Copied!'); }}
                            className="text-white/60 hover:text-white font-bold text-xs flex items-center gap-2"
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto bg-black/30 p-4 rounded-xl shadow-inner scrollbar-hide">{ocrResult}</pre>
                </div>
            )}

            <FabricPdfEditor
                imageUrl={renderedUrl}
                width={dims.width}
                height={dims.height}
                annotations={page.annotations}
                onSave={(newAnns) => onUpdate({ annotations: newAnns })}
            />
        </div>
    );
}

// ─── Main Tool Component ────────────────────────────────────────────────────

export function PdfMergeTool({ initialMode }: { initialMode?: string } = {}) {
    const [sources, setSources] = useState<SourceFile[]>([]);
    const [pages, setPages] = useState<MergePage[]>([]);
    const [status, setStatus] = useState<MergeStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [mergedSize, setMergedSize] = useState<number | null>(null);
    const [outputName, setOutputName] = useState('merged_document');
    const [progress, setProgress] = useState(0);
    const [dropZoneActive, setDropZoneActive] = useState(false);
    const [watermarkText, setWatermarkText] = useState('');

    // View state
    const [viewMode, setViewMode] = useState<ViewMode>('md');
    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    const [fullEditorMode, setFullEditorMode] = useState(false);

    // Drag state
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const [dragMode, setDragMode] = useState<'swap' | 'shift'>('swap');

    // Selection state
    const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
    const [watermarkApplyMode, setWatermarkApplyMode] = useState<'all' | 'selected'>('all');

    // Viewer modal state
    const [viewerPage, setViewerPage] = useState<MergePage | null>(null);
    const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'png' | 'jpeg'>('pdf');

    const inputRef = useRef<HTMLInputElement>(null);
    const colorIdx = useRef(0);

    // ─── Actions ──────────────────────────────────────────────────────────

    const addFiles = useCallback(async (fileList: FileList | File[]) => {
        const arr = Array.from(fileList);
        const pdfs = arr.filter(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
        const imgs = arr.filter(f => f.type.startsWith('image/'));

        if (!pdfs.length && !imgs.length) {
            setErrorMsg('Please upload valid PDF or Image files.');
            return;
        }
        setErrorMsg('');

        const newSources: SourceFile[] = [];
        const newPages: MergePage[] = [];

        // Handle PDFs
        for (const file of pdfs) {
            const buf = await file.arrayBuffer();
            let pageCount = 0;
            try {
                const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
                pageCount = doc.getPageCount();
            } catch { continue; }

            const color = FILE_COLORS[colorIdx.current % FILE_COLORS.length];
            colorIdx.current++;
            const fileId = uid();

            newSources.push({ id: fileId, name: file.name, arrayBuffer: buf, pageCount, color });

            for (let i = 0; i < pageCount; i++) {
                newPages.push({
                    id: uid(),
                    fileId,
                    fileName: file.name,
                    fileColor: color,
                    srcIndex: i,
                    thumbnail: null,
                    rotation: 0,
                    excluded: false,
                    annotations: [],
                });
            }
        }

        // Handle Images (Convert to PDF on the fly)
        for (const file of imgs) {
            try {
                const imgBuf = await file.arrayBuffer();
                const tempPdf = await PDFDocument.create();
                let embeddedImg;
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    embeddedImg = await tempPdf.embedJpg(imgBuf);
                } else if (file.type === 'image/png') {
                    embeddedImg = await tempPdf.embedPng(imgBuf);
                } else {
                    // Fallback for other formats (webp) via canvas if browser supports
                    // For now, only native pdf-lib supported formats
                    continue;
                }

                const page = tempPdf.addPage([embeddedImg.width, embeddedImg.height]);
                page.drawImage(embeddedImg, { x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height });

                const pdfBuf = await tempPdf.save();
                const color = FILE_COLORS[colorIdx.current % FILE_COLORS.length];
                colorIdx.current++;
                const fileId = uid();

                newSources.push({ id: fileId, name: file.name, arrayBuffer: pdfBuf, pageCount: 1, color });
                newPages.push({
                    id: uid(),
                    fileId,
                    fileName: file.name,
                    fileColor: color,
                    srcIndex: 0,
                    thumbnail: URL.createObjectURL(new Blob([imgBuf], { type: file.type })),
                    rotation: 0,
                    excluded: false,
                    annotations: [],
                });
            } catch (err) {
                console.error("Image conversion error", err);
            }
        }

        setSources(prev => [...prev, ...newSources]);
        setPages(prev => [...prev, ...newPages]);
        if (downloadUrl) { URL.revokeObjectURL(downloadUrl); setDownloadUrl(null); }
        setStatus('idle');

        // Background thumbnail generation for PDFs only (Images already have thumbs)
        for (const src of newSources) {
            if (src.name.toLowerCase().endsWith('.pdf')) {
                for (let i = 0; i < src.pageCount; i++) {
                    const thumb = await renderPage(src.arrayBuffer, i);
                    if (thumb) {
                        setPages(prev => prev.map(p =>
                            p.fileId === src.id && p.srcIndex === i ? { ...p, thumbnail: thumb } : p
                        ));
                    }
                }
            }
        }
    }, [downloadUrl]);

    const updatePage = (id: string, updates: Partial<MergePage>) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (viewerPage?.id === id) setViewerPage(prev => prev ? { ...prev, ...updates } : null);
    };

    const toggleExclude = (id: string) => updatePage(id, { excluded: !pages.find(p => p.id === id)?.excluded });
    const rotatePage = (id: string) => {
        const p = pages.find(x => x.id === id);
        if (p) updatePage(id, { rotation: ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270 });
    };
    const deletePage = (id: string) => setPages(prev => prev.filter(p => p.id !== id));
    const duplicatePage = (id: string) => {
        setPages(prev => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx < 0) return prev;
            const copy = { ...prev[idx], id: uid() };
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
        });
    };

    const togglePageSelection = (id: string) => {
        setSelectedPageIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const selectAllPages = () => setSelectedPageIds(pages.map(p => p.id));
    const deselectAllPages = () => setSelectedPageIds([]);

    const bulkDelete = () => {
        setPages(prev => prev.filter(p => !selectedPageIds.includes(p.id)));
        setSelectedPageIds([]);
    };
    const bulkRotate = () => {
        setPages(prev => prev.map(p => selectedPageIds.includes(p.id) ? { ...p, rotation: ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270 } : p));
    };
    const bulkDuplicate = () => {
        setPages(prev => {
            const next = [...prev];
            const toAdd: { idx: number, page: MergePage }[] = [];
            prev.forEach((p, i) => {
                if (selectedPageIds.includes(p.id)) toAdd.push({ idx: i, page: { ...p, id: uid() } });
            });
            for (let i = toAdd.length - 1; i >= 0; i--) next.splice(toAdd[i].idx + 1, 0, toAdd[i].page);
            return next;
        });
    };
    const bulkAddText = () => {
        const newAnnBase: Annotation = { id: uid(), type: 'text', text: 'New Annotation', x: 50, y: 50, color: '#ef4444', fontSize: 24 };
        setPages(prev => prev.map(p => selectedPageIds.includes(p.id) ? { ...p, annotations: [...p.annotations, { ...newAnnBase, id: uid() }] } : p));
    };

    const movePage = (id: string, targetIdx: number) => {
        setPages(prev => {
            const idx = prev.findIndex(p => p.id === id);
            if (idx === -1 || idx === targetIdx) return prev;
            const next = [...prev];
            const [moved] = next.splice(idx, 1);
            next.splice(targetIdx, 0, moved);
            return next;
        });
    };

    const clearAll = () => {
        setPages([]); setSources([]); setSelectedPageIds([]); colorIdx.current = 0;
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null); setErrorMsg(''); setStatus('idle'); setProgress(0);
    };

    // ─── Drag-to-reorder ──────────────────────────────────────────────────

    const onDragStart = (idx: number) => setDragIdx(idx);
    const onDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
    const onDrop = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDragOverIdx(null); return; }
        setPages(prev => {
            const arr = [...prev];
            if (dragMode === 'swap') {
                const temp = arr[dragIdx]; arr[dragIdx] = arr[idx]; arr[idx] = temp;
            } else {
                const [moved] = arr.splice(dragIdx, 1); arr.splice(idx, 0, moved);
            }
            return arr;
        });
        setDragIdx(null); setDragOverIdx(null);
    };
    const onDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

    // ─── Merge & Export ───────────────────────────────────────────────────

    const mergePdfs = async () => {
        const active = pages.filter(p => !p.excluded);
        if (active.length < 1) { setErrorMsg('No pages selected to merge.'); return; }
        setStatus('processing'); setErrorMsg(''); setProgress(0);

        try {
            const merged = await PDFDocument.create();
            const HelveticaBold = await merged.embedFont(StandardFonts.HelveticaBold);

            // Load source documents into cache
            const srcCache: Record<string, PDFDocument> = {};
            for (const src of sources) {
                srcCache[src.id] = await PDFDocument.load(src.arrayBuffer, { ignoreEncryption: true });
            }

            for (let i = 0; i < active.length; i++) {
                const p = active[i];
                const srcDoc = srcCache[p.fileId];
                if (!srcDoc) continue;

                const [copied] = await merged.copyPages(srcDoc, [p.srcIndex]);
                if (p.rotation !== 0) copied.setRotation(degrees(p.rotation));

                const { width, height } = copied.getSize();

                // Composite Annotations
                for (const ann of p.annotations) {
                    const c = hexToRgbVals(ann.color);
                    if (ann.type === 'text') {
                        const fontSize = ann.fontSize || 24;
                        copied.drawText(ann.text || '', {
                            x: (ann.x / 100) * width,
                            y: ((100 - ann.y) / 100) * height - (fontSize / 2),
                            size: fontSize,
                            font: HelveticaBold,
                            color: rgb(c.r, c.g, c.b),
                        });
                    } else if (ann.type === 'rect') {
                        copied.drawRectangle({
                            x: (ann.x / 100) * width,
                            y: ((100 - ann.y - (ann.height || 0)) / 100) * height,
                            width: ((ann.width || 0) / 100) * width,
                            height: ((ann.height || 0) / 100) * height,
                            borderColor: rgb(c.r, c.g, c.b),
                            borderWidth: 2,
                        });
                    }
                }

                // Global Watermark
                if (watermarkText.trim() && (watermarkApplyMode === 'all' || selectedPageIds.includes(p.id))) {
                    const text = watermarkText.trim();
                    const size = Math.min(width, height) * 0.1;
                    const textWidth = HelveticaBold.widthOfTextAtSize(text, size);
                    const angle = Math.atan2(height, width);
                    copied.drawText(text, {
                        x: width / 2 - (Math.cos(angle) * textWidth) / 2,
                        y: height / 2 - (Math.sin(angle) * textWidth) / 2,
                        size,
                        font: HelveticaBold,
                        color: rgb(0, 0, 0),
                        opacity: 0.1,
                        rotate: degrees((angle * 180) / Math.PI),
                    });
                }

                merged.addPage(copied);
                setProgress(Math.round(((i + 1) / active.length) * 100));
            }

            const bytes = await merged.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(URL.createObjectURL(blob));
            setMergedSize(blob.size);
            setStatus('done');
        } catch (err: any) {
            setErrorMsg(err?.message || 'Merge failed.');
            setStatus('error');
        }
    };

    const exportSinglePage = async (page: MergePage, format: 'pdf' | 'png' | 'jpeg') => {
        try {
            const src = sources.find(s => s.id === page.fileId);
            if (!src) return;

            const dlName = `${page.fileName.replace(/\.pdf$/i, '')}_page_${page.srcIndex + 1}`;

            if (format === 'pdf') {
                const pdfDoc = await PDFDocument.create();
                const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                const srcDoc = await PDFDocument.load(src.arrayBuffer, { ignoreEncryption: true });
                const [copied] = await pdfDoc.copyPages(srcDoc, [page.srcIndex]);
                if (page.rotation !== 0) copied.setRotation(degrees(page.rotation));

                const { width, height } = copied.getSize();

                for (const ann of page.annotations) {
                    const c = hexToRgbVals(ann.color);
                    if (ann.type === 'text') {
                        pdfDoc.getPages()[0]?.drawText(ann.text || '', {
                            x: (ann.x / 100) * width,
                            y: ((100 - ann.y) / 100) * height - ((ann.fontSize || 24) / 2),
                            size: ann.fontSize || 24, font, color: rgb(c.r, c.g, c.b),
                        });
                    }
                }
                pdfDoc.addPage(copied);
                const bytes = await pdfDoc.save();
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `${dlName}.pdf`; a.click();
            } else {
                // High-Res Image Export Logic (Simplified for brevity, similar to merge)
                const pdfjsLib = await import('pdfjs-dist');
                if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
                const pdf = await pdfjsLib.getDocument({ data: src.arrayBuffer.slice(0) }).promise;
                const pdfPage = await pdf.getPage(page.srcIndex + 1);
                const vp = pdfPage.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                canvas.width = vp.width; canvas.height = vp.height;
                const ctx = canvas.getContext('2d')!;
                await pdfPage.render({ canvasContext: ctx, viewport: vp }).promise;
                const a = document.createElement('a'); a.href = canvas.toDataURL(`image/${format}`, 1.0); a.download = `${dlName}.${format === 'jpeg' ? 'jpg' : 'png'}`; a.click();
            }
        } catch (err) { console.error('Export failed', err); }
    };

    const exportBatchAsImages = async () => {
        const active = pages.filter(p => !p.excluded);
        if (active.length < 1) { setErrorMsg('No pages to export.'); return; }
        setStatus('processing'); setProgress(0); setErrorMsg('');

        try {
            const zip = new JSZip();
            const pdfjsLib = await import('pdfjs-dist');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

            for (let i = 0; i < active.length; i++) {
                const page = active[i];
                const src = sources.find(s => s.id === page.fileId);
                if (!src) continue;

                const pdf = await pdfjsLib.getDocument({ data: src.arrayBuffer.slice(0) }).promise;
                const pdfPage = await pdf.getPage(page.srcIndex + 1);
                const vp = pdfPage.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                canvas.width = vp.width; canvas.height = vp.height;
                const ctx = canvas.getContext('2d')!;
                await pdfPage.render({ canvasContext: ctx, viewport: vp }).promise;

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                const base64Data = dataUrl.split(',')[1];
                zip.file(`${outputName}_page_${i + 1}.jpg`, base64Data, { base64: true });
                setProgress(Math.round(((i + 1) / active.length) * 100));
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a'); a.href = url; a.download = `${outputName}_images.zip`; a.click();
            setStatus('done');
        } catch (err: any) {
            setErrorMsg(err?.message || 'Batch export failed.');
            setStatus('error');
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────

    const includedCount = pages.filter(p => !p.excluded).length;

    return (
        <div className="space-y-6 font-sans select-none pb-32">

            {/* Header & Controls */}
            <div className="flex flex-wrap items-center gap-4">
                <button
                    onClick={() => inputRef.current?.click()}
                    title="Upload PDF documents or images to merge"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all shadow-sm"
                >
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Add PDFs / Images
                </button>
                <input ref={inputRef} type="file" accept=".pdf,image/*" multiple className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />

                {pages.length > 0 && (
                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                        <button onClick={() => setViewMode('md')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'md' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Icons</button>
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>List</button>
                    </div>
                )}

                {pages.length > 0 && (
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-slate-400 px-2">Drag</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setDragMode('swap')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dragMode === 'swap' ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Swap</button>
                            <button onClick={() => setDragMode('shift')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dragMode === 'shift' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Shift</button>
                        </div>
                    </div>
                )}

                {pages.length > 0 && (
                    <button
                        onClick={() => setFullEditorMode(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/20 transition-all border border-blue-500/50"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        Full Editor
                    </button>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {pages.length > 0 && <button onClick={clearAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors">Reset</button>}
                </div>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm font-medium rounded-lg border border-red-100 dark:border-red-900/30">{errorMsg}</div>}

            {/* Page Grid/List Area */}
            {pages.length === 0 ? (
                <div onClick={() => inputRef.current?.click()} className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-white/5 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                    <svg className="w-12 h-12 text-slate-300 dark:text-white/10 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625C5.004 3 4.5 3.504 4.5 4.125v15.75c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-bold">Select PDF files to begin</p>
                    <p className="text-xs text-slate-400 mt-1">Files remain 100% private in your browser</p>
                </div>
            ) : (
                <div
                    className={viewMode === 'list' ? 'space-y-2' : 'grid gap-4'}
                    style={viewMode !== 'list' ? { gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' } : {}}
                >
                    {pages.map((p, i) => (
                        <PageCard
                            key={p.id} page={p} position={i + 1} viewMode={viewMode}
                            isDragging={dragIdx === i} isDragTarget={dragOverIdx === i}
                            isSelected={selectedPageIds.includes(p.id)}
                            onToggleSelect={() => togglePageSelection(p.id)}
                            onDragStart={() => onDragStart(i)}
                            onDragOver={(e) => onDragOver(e, i)}
                            onDrop={(e) => onDrop(e, i)}
                            onDragEnd={onDragEnd}
                            onToggleExclude={() => toggleExclude(p.id)}
                            onRotate={() => rotatePage(p.id)}
                            onDelete={() => deletePage(p.id)}
                            onDuplicate={() => duplicatePage(p.id)}
                            onView={() => setViewerPage(p)}
                            onMoveLeft={() => i > 0 && movePage(p.id, i - 1)}
                            onMoveRight={() => i < pages.length - 1 && movePage(p.id, i + 1)}
                            onMoveToStart={() => movePage(p.id, 0)}
                            onMoveToEnd={() => movePage(p.id, pages.length - 1)}
                        />
                    ))}
                </div>
            )}

            {/* Bottom Floating Bar */}
            {pages.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-5xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 flex flex-wrap items-center justify-between gap-4 z-40">
                    <div className="flex flex-col gap-1 min-w-[200px]">
                        <input value={outputName} onChange={e => setOutputName(e.target.value)} placeholder="Project Name" className="bg-transparent border-0 font-bold text-slate-800 dark:text-white outline-none" />
                        <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{includedCount} Pages Selected</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Watermark</span>
                            <input value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="Optional" className="bg-transparent border-0 text-sm font-semibold outline-none w-24 text-slate-800 dark:text-white" />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={mergePdfs}
                                disabled={status === 'processing'}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-xl shadow-xl shadow-blue-500/30 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {status === 'processing' ? <><div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> {progress}%</> : 'Generate PDF'}
                            </button>
                            <button
                                onClick={exportBatchAsImages}
                                disabled={status === 'processing'}
                                title="Export all pages as individual JPG images in a ZIP"
                                className="bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest px-4 py-3 rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                JPG Zip
                            </button>
                        </div>

                        {status === 'done' && downloadUrl && (
                            <a href={downloadUrl} download={`${outputName}.pdf`} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-xl shadow-xl shadow-emerald-500/30 transition-all">Download Result</a>
                        )}
                    </div>
                </div>
            )}

            {/* Modal & Overlays */}
            {viewerPage && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4 animate-in fade-in duration-200" onClick={() => setViewerPage(null)}>
                    <div className="w-full max-w-5xl h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="h-20 shrink-0 flex items-center justify-between px-8 border-b border-white/5 bg-slate-800/50">
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-widest leading-none truncate max-w-[200px] mb-1">{viewerPage.fileName}</h4>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Page {viewerPage.srcIndex + 1}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                                    <div className="relative group/sel">
                                        <select
                                            value={selectedExportFormat}
                                            onChange={e => setSelectedExportFormat(e.target.value as any)}
                                            className="bg-transparent text-white font-black text-[10px] uppercase tracking-widest pl-4 pr-10 py-2 outline-none appearance-none cursor-pointer hover:bg-white/5 rounded-xl transition-all border-none"
                                        >
                                            <option value="pdf" className="bg-slate-900 text-white font-bold uppercase">PDF Document</option>
                                            <option value="png" className="bg-slate-900 text-white font-bold uppercase">PNG High-Res</option>
                                            <option value="jpeg" className="bg-slate-900 text-white font-bold uppercase">JPG Photo</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => exportSinglePage(viewerPage, selectedExportFormat)}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
                                    >
                                        Download
                                    </button>
                                </div>
                                <button onClick={() => setViewerPage(null)} className="p-2 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-900/50 scrollbar-elegant flex items-center justify-center">
                            <HighResEditorWrapper page={viewerPage} sources={sources} onUpdate={(u) => updatePage(viewerPage.id, u)} />
                        </div>
                    </div>
                </div>
            )}

            {fullEditorMode && (
                <div className="fixed inset-0 z-[1100] bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="h-16 shrink-0 bg-slate-900 border-b border-white/5 flex items-center justify-between px-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setFullEditorMode(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                            <h2 className="text-white font-black text-xs uppercase tracking-widest">Full Document Editor</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={mergePdfs} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-lg shadow-lg shadow-blue-600/20">Finalize & Preview</button>
                            <button onClick={() => setFullEditorMode(false)} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase rounded-lg">Close</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-16 scrollbar-elegant">
                        {pages.filter(p => !p.excluded).map((p, idx) => (
                            <div key={p.id} className="max-w-4xl mx-auto space-y-4">
                                <div className="flex items-center justify-between text-slate-500 font-black text-[9px] uppercase tracking-widest">
                                    <span>Page {idx + 1} / {includedCount}</span>
                                    <span className="opacity-50">{p.fileName}</span>
                                </div>
                                <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-white/5 overflow-hidden">
                                    <HighResEditorWrapper page={p} sources={sources} onUpdate={(u) => updatePage(p.id, u)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Sub-Component: PageCard ────────────────────────────────────────────────

interface PageCardProps {
    page: MergePage;
    position: number;
    viewMode: ViewMode;
    isDragging: boolean;
    isDragTarget: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    onToggleExclude: () => void;
    onRotate: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onView: () => void;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
    onMoveToStart?: () => void;
    onMoveToEnd?: () => void;
}

function PageCard({
    page, position, viewMode, isDragging, isDragTarget, isSelected,
    onToggleSelect, onDragStart, onDragOver, onDrop, onDragEnd,
    onToggleExclude, onRotate, onDelete, onDuplicate, onView,
    onMoveLeft, onMoveRight, onMoveToStart, onMoveToEnd,
}: PageCardProps) {
    if (viewMode === 'list') {
        return (
            <div
                draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
                className={`group relative flex flex-row items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border transition-all duration-150 cursor-grab active:cursor-grabbing
                    ${isDragging ? 'opacity-30 scale-[0.98]' : 'border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50'}
                    ${isDragTarget ? 'ring-2 ring-blue-500' : ''}
                    ${page.excluded ? 'opacity-40 grayscale' : ''}
                `}
            >
                <div className="w-6 shrink-0 text-slate-300 font-black text-[10px] text-center">{position}</div>
                <div onClick={e => { e.stopPropagation(); onToggleSelect(); }} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-white/20 hover:border-blue-500'}`}>
                    {isSelected && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                </div>
                <div onClick={onView} title="Click to View/Edit" className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                    {page.thumbnail ? <img src={page.thumbnail} alt="" className="w-full h-full object-cover" style={{ transform: `rotate(${page.rotation}deg)` }} /> : <div className="w-full h-full bg-slate-200 dark:bg-white/5 animate-pulse" />}
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white dark:border-slate-900" style={{ background: page.fileColor }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{page.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Source Page {page.srcIndex + 1}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onMoveToStart?.(); }} title="Move to Start" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onMoveLeft?.(); }} title="Move Left" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onMoveRight?.(); }} title="Move Right" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onMoveToEnd?.(); }} title="Move to End" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onRotate(); }} title="Rotate Page" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-orange-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remove Page" className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>
        );
    }

    return (
        <div
            draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
            className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 transition-all duration-150 cursor-grab active:cursor-grabbing
                ${isDragging ? 'opacity-30 scale-95' : 'hover:shadow-xl hover:-translate-y-1'}
                ${isDragTarget ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-slate-900' : ''}
                ${page.excluded ? 'opacity-40 grayscale' : ''}
            `}
        >
            <div onClick={onView} className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${page.excluded ? 'border-slate-100 dark:border-white/5' : 'border-slate-200 dark:border-white/10 group-hover:border-blue-500/50 shadow-md'}`}>
                {page.thumbnail ? <img src={page.thumbnail} alt="" className="w-full h-full object-cover" style={{ transform: `rotate(${page.rotation}deg)` }} /> : <div className="w-full h-full bg-slate-100 dark:bg-white/5" />}
                <div onClick={e => { e.stopPropagation(); onToggleSelect(); }} className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white dark:bg-slate-900 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 opacity-0 group-hover:opacity-100'}`}>
                    {isSelected && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                </div>
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800" style={{ background: page.fileColor }} />
                {page.rotation !== 0 && <div className="absolute top-6 right-2 text-[8px] bg-orange-500 text-white px-1 font-black rounded">{page.rotation}°</div>}

                {/* Hover Quick Actions */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all px-2">
                    <button onClick={e => { e.stopPropagation(); onMoveToStart?.(); }} title="Move to Start" className="w-8 h-8 md:w-9 md:h-9 bg-slate-900/90 dark:bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-xl border border-white/10 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" /></svg></button>
                    <button onClick={e => { e.stopPropagation(); onMoveLeft?.(); }} title="Shift Left" className="w-8 h-8 md:w-9 md:h-9 bg-slate-900/90 dark:bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-xl border border-white/10 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                    <button onClick={e => { e.stopPropagation(); onMoveRight?.(); }} title="Shift Right" className="w-8 h-8 md:w-9 md:h-9 bg-slate-900/90 dark:bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-xl border border-white/10 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
                    <button onClick={e => { e.stopPropagation(); onMoveToEnd?.(); }} title="Move to End" className="w-8 h-8 md:w-9 md:h-9 bg-slate-900/90 dark:bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-xl border border-white/10 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg></button>
                    <button onClick={e => { e.stopPropagation(); onRotate(); }} title="Rotate Page" className="w-8 h-8 md:w-9 md:h-9 bg-slate-900/90 dark:bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-colors shadow-xl border border-white/10 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg></button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); }} title="Remove Page" className="w-8 h-8 md:w-9 md:h-9 bg-slate-900/90 dark:bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-xl border border-white/10 shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>
            <div className="text-center px-1">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{position}</div>
                <div onClick={onView} title="Click to View/Edit" className="text-[9px] text-slate-300 truncate w-full mt-1 opacity-50 cursor-pointer hover:opacity-100">{page.fileName}</div>
            </div>
        </div>
    );
}
