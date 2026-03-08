
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, IText, Rect, Path, FabricImage } from 'fabric';

interface FabricPdfEditorProps {
    imageUrl: string;
    width: number;
    height: number;
    annotations: any[];
    onSave: (annotations: any[]) => void;
}

export const FabricPdfEditor: React.FC<FabricPdfEditorProps> = ({
    imageUrl,
    width,
    height,
    annotations,
    onSave
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvas = useRef<Canvas | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate initial fit-to-screen zoom
    useEffect(() => {
        const updateZoom = () => {
            if (!containerRef.current) return;
            const padding = 64;
            const availableW = containerRef.current.clientWidth - padding;
            const availableH = containerRef.current.clientHeight - padding;

            const scaleW = availableW / width;
            const scaleH = availableH / height;
            const fitScale = Math.min(scaleW, scaleH, 1);
            setZoom(fitScale);
        };

        updateZoom();
        window.addEventListener('resize', updateZoom);
        return () => window.removeEventListener('resize', updateZoom);
    }, [width, height]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: '#ffffff'
        });
        fabricCanvas.current = canvas;

        // Load background image
        FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
            img.set({
                selectable: false,
                evented: false,
            });
            canvas.add(img);
            canvas.sendObjectToBack(img);
            canvas.renderAll();
        }).catch(err => console.error("Fabric image load error:", err));

        // Load existing annotations
        annotations.forEach(ann => {
            if (ann.type === 'text') {
                const text = new IText(ann.text, {
                    left: (ann.x / 100) * width,
                    top: (ann.y / 100) * height,
                    fontSize: ann.fontSize || 24,
                    fill: ann.color || '#ef4444',
                    fontFamily: 'Helvetica',
                });
                canvas.add(text);
            } else if (ann.type === 'rect') {
                const rect = new Rect({
                    left: (ann.x / 100) * width,
                    top: (ann.y / 100) * height,
                    width: (ann.width / 100) * width,
                    height: (ann.height / 100) * height,
                    fill: 'transparent',
                    stroke: ann.color || '#3b82f6',
                    strokeWidth: 3,
                });
                canvas.add(rect);
            }
        });

        const handleChange = () => {
            if (isSaving) return;
            const currentObjects = canvas.getObjects();
            const newAnnotations = currentObjects
                .filter(obj => obj.selectable !== false) // only save user-added objects
                .map(obj => {
                    const common = {
                        id: (obj as any).id || Math.random().toString(36).substr(2, 9),
                        left: obj.left,
                        top: obj.top,
                        x: (obj.left || 0) / width * 100,
                        y: (obj.top || 0) / height * 100,
                    };

                    if (obj.type === 'i-text' || obj.type === 'text') {
                        const t = obj as IText;
                        return { ...common, type: 'text', text: t.text || '', fontSize: t.fontSize, color: t.fill };
                    } else if (obj.type === 'rect') {
                        const r = obj as Rect;
                        return { ...common, type: 'rect', width: (r.width || 0) / width * 100, height: (r.height || 0) / height * 100, color: r.stroke };
                    } else if (obj.type === 'path') {
                        return { ...common, type: 'path', color: obj.stroke };
                    }
                    return null;
                })
                .filter(Boolean);

            onSave(newAnnotations as any[]);
        };

        canvas.on('object:modified', handleChange);
        canvas.on('object:added', handleChange);
        canvas.on('object:removed', handleChange);

        return () => {
            canvas.dispose();
        };
    }, [imageUrl, width, height]);

    const addText = () => {
        if (!fabricCanvas.current) return;
        const text = new IText('New Text', {
            left: width / 2,
            top: height / 2,
            fontSize: 24,
            fill: '#ef4444',
            fontFamily: 'Helvetica',
        });
        fabricCanvas.current.add(text);
        fabricCanvas.current.setActiveObject(text);
    };

    const addRect = () => {
        if (!fabricCanvas.current) return;
        const rect = new Rect({
            left: width / 2 - 50,
            top: height / 2 - 50,
            fill: 'transparent',
            stroke: '#3b82f6',
            strokeWidth: 3,
            width: 100,
            height: 100
        });
        fabricCanvas.current.add(rect);
        fabricCanvas.current.setActiveObject(rect);
    };

    const addArrow = () => {
        if (!fabricCanvas.current) return;
        const arrow = new Path('M 0 0 L 50 0 M 50 0 L 40 -5 M 50 0 L 40 5', {
            left: width / 2,
            top: height / 2,
            stroke: '#10b981',
            strokeWidth: 4,
            fill: 'transparent',
            scaleX: 2,
            scaleY: 2
        });
        fabricCanvas.current.add(arrow);
        fabricCanvas.current.setActiveObject(arrow);
    };

    return (
        <div className="w-full h-full flex flex-col items-center gap-4 py-4 overflow-hidden scrollbar-elegant">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/10 dark:bg-slate-950/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 sticky top-0 z-[100] ring-1 ring-white/5">
                <button onClick={addText} title="Add Text Tool" className="px-4 py-2 hover:bg-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
                    Text
                </button>
                <button onClick={addRect} title="Rectangle Tool" className="px-4 py-2 hover:bg-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                    <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" /></svg>
                    Box
                </button>
                <button onClick={addArrow} title="Arrow Tool" className="px-4 py-2 hover:bg-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                    Arrow
                </button>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
                    <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 px-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                    </button>
                    <span className="text-[9px] font-black text-white/50 w-10 text-center uppercase tracking-widest">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-1 px-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </button>
                </div>
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <button
                    onClick={() => {
                        const active = fabricCanvas.current?.getActiveObject();
                        if (active) fabricCanvas.current?.remove(active);
                    }}
                    title="Delete Selection"
                    className="px-4 py-2 hover:bg-red-500/10 rounded-xl text-red-400 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                    Delete
                </button>
            </div>
            <div ref={containerRef} className="flex-1 w-full flex items-center justify-center p-4 bg-slate-900/30 overflow-hidden relative">
                <div
                    className="shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-white border border-white/5 rounded-sm overflow-hidden transition-transform duration-200 ease-out will-change-transform"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                    }}
                >
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
};
