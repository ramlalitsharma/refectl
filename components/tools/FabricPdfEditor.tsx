"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, IText, Rect, Path, FabricImage, TEvent } from 'fabric';
import { AbstractPdfTool } from '@/lib/pdf/AbstractPdfTool';
import { DrawTool } from '@/lib/pdf/tools/DrawTool';
import { HighlightTool } from '@/lib/pdf/tools/HighlightTool';
import { TextTool } from '@/lib/pdf/tools/TextTool';
import { ShapeTool } from '@/lib/pdf/tools/ShapeTool';
import { Zap, Type, Square, ArrowRight, Trash2, Search, Wand2, FileSearch, Library, Circle, Triangle, Star, Palette, Check, X, PenTool } from 'lucide-react';

interface FabricPdfEditorProps {
    imageUrl: string;
    width: number;
    height: number;
    annotations: any[];
    onSave: (annotations: any[]) => void;
    ocrAction?: { onClick: () => void; loading?: boolean };
}

export const FabricPdfEditor: React.FC<FabricPdfEditorProps> = ({
    imageUrl,
    width,
    height,
    annotations,
    onSave,
    ocrAction
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvas = useRef<Canvas | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const toolInstance = useRef<AbstractPdfTool | null>(null);
    const [activeColor, setActiveColor] = useState<string>('#ef4444');
    const [activeWidth, setActiveWidth] = useState<number>(3);
    const [activeToolId, setActiveToolId] = useState<string>('select');
    type FitMode = 'page' | 'width' | 'manual';
    const [fitMode, setFitMode] = useState<FitMode>('width');
    const fitModeRef = useRef<FitMode>('width');
    const prevZoomRef = useRef(1);
    const pendingScrollReset = useRef(false);

    // Initialize tools map
    const toolsMap = useRef<Record<string, (c: Canvas) => AbstractPdfTool>>({
        'draw': (c) => new DrawTool(c),
        'highlight': (c) => new HighlightTool(c),
        'text': (c) => new TextTool(c),
        'rect': (c) => new ShapeTool(c, 'rect'),
        'circle': (c) => new ShapeTool(c, 'circle'),
        'triangle': (c) => new ShapeTool(c, 'triangle'),
        'star': (c) => new ShapeTool(c, 'star'),
        'check': (c) => new ShapeTool(c, 'check'),
        'cross': (c) => new ShapeTool(c, 'cross'),
        'arrow': (c) => new ShapeTool(c, 'arrow'),
    });

    useEffect(() => {
        fitModeRef.current = fitMode;
    }, [fitMode]);

    const resetScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollLeft = 0;
        el.scrollTop = 0;
    };

    const recalcZoom = (mode?: FitMode) => {
        const el = containerRef.current;
        const effectiveMode = mode ?? fitModeRef.current;
        if (!el || width <= 0 || height <= 0 || effectiveMode === 'manual') return;

        const styles = window.getComputedStyle(el);
        const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        const availableW = el.clientWidth - paddingX;
        const availableH = el.clientHeight - paddingY;
        if (availableW <= 0 || availableH <= 0) return;

        const scaleW = availableW / width;
        const scaleH = availableH / height;
        const fitScale = effectiveMode === 'width' ? scaleW : Math.min(scaleW, scaleH);
        const clamped = Math.min(Math.max(fitScale, 0.1), 4.5);
        pendingScrollReset.current = true;
        if (Math.abs(clamped - zoom) < 0.001) {
            resetScroll();
            prevZoomRef.current = zoom;
            pendingScrollReset.current = false;
        }
        setZoom(clamped);
    };

    // Calculate initial fit-to-screen zoom and keep it in sync with layout changes.
    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;

        recalcZoom();
        const rafId = requestAnimationFrame(() => recalcZoom());
        const observer = new ResizeObserver(() => recalcZoom());
        observer.observe(el);
        window.addEventListener('resize', recalcZoom);
        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
            window.removeEventListener('resize', recalcZoom);
        };
    }, [width, height, fitMode]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const prevZoom = prevZoomRef.current;
        if (prevZoom === zoom) return;

        const viewportW = el.clientWidth;
        const viewportH = el.clientHeight;

        if (pendingScrollReset.current || fitModeRef.current !== 'manual') {
            el.scrollLeft = 0;
            el.scrollTop = 0;
            pendingScrollReset.current = false;
        } else {
            const ratio = zoom / prevZoom;
            const nextLeft = (el.scrollLeft + viewportW / 2) * ratio - viewportW / 2;
            const nextTop = (el.scrollTop + viewportH / 2) * ratio - viewportH / 2;
            el.scrollLeft = Math.max(0, nextLeft);
            el.scrollTop = Math.max(0, nextTop);
        }

        prevZoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
        if (!canvasRef.current || width <= 0 || height <= 0) return;

        const canvas = new Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: '#ffffff'
        });
        fabricCanvas.current = canvas;
        const canvasEl = canvas.getElement();
        canvasEl.style.width = '100%';
        canvasEl.style.height = '100%';
        canvasEl.style.display = 'block';

        // Load background image
        FabricImage.fromURL(imageUrl).then((img) => {
            img.set({
                selectable: false,
                evented: false,
                scaleX: width / img.width!,
                scaleY: height / img.height!,
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                // @ts-ignore
                id: 'pdf-page-bg'
            });

            // Remove any old bg first
            const oldBg = canvas.getObjects().find(o => (o as any).id === 'pdf-page-bg');
            if (oldBg) canvas.remove(oldBg);

            canvas.add(img);
            canvas.sendObjectToBack(img);
            canvas.renderAll();
            handleChange();
        }).catch(err => {
            console.error("Fabric image load error:", err);
            canvas.backgroundColor = '#f8fafc';
            canvas.renderAll();
        });

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

        canvas.renderAll();

        const handleChange = () => {
            if (isSaving) return;
            const currentObjects = canvas.getObjects();
            const newAnnotations = currentObjects
                .filter(obj => (obj as any).id !== 'pdf-page-bg') // exclude background
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

        const handleMouseDown = (e: TEvent) => toolInstance.current?.onMouseDown(e);
        const handleMouseMove = (e: TEvent) => toolInstance.current?.onMouseMove(e);
        const handleMouseUp = (e: TEvent) => toolInstance.current?.onMouseUp(e);

        canvas.on('mouse:down', handleMouseDown);
        canvas.on('mouse:move', handleMouseMove);
        canvas.on('mouse:up', handleMouseUp);
        canvas.on('object:modified', handleChange);
        canvas.on('object:added', handleChange);
        canvas.on('object:removed', handleChange);

        return () => {
            canvas.dispose();
        };
    }, [imageUrl, width, height]);

    // Handle Tool Switching
    useEffect(() => {
        if (!fabricCanvas.current) return;

        // Deactivate old tool
        if (toolInstance.current) {
            toolInstance.current.deactivate();
        }

        // Activate new tool
        if (activeToolId !== 'select' && toolsMap.current[activeToolId]) {
            toolInstance.current = toolsMap.current[activeToolId](fabricCanvas.current);
            toolInstance.current.setStrokeSettings(activeColor, activeWidth);
            toolInstance.current.activate();
            fabricCanvas.current.selection = false;
        } else {
            toolInstance.current = null;
            fabricCanvas.current.selection = true;
            fabricCanvas.current.isDrawingMode = false;
        }
    }, [activeToolId, activeColor, activeWidth]);

    const deleteSelection = () => {
        const active = fabricCanvas.current?.getActiveObject();
        if (active) fabricCanvas.current?.remove(active);
    };

    const ToolButton = ({ id, icon: Icon, label, title }: { id: string, icon: any, label: string, title?: string }) => {
        const isActive = activeToolId === id;
        return (
            <button
                onClick={() => setActiveToolId(id)}
                title={title || label}
                className={`group relative px-2 py-1.5 rounded-xl transition-all duration-300 flex flex-col items-center gap-1 min-w-[48px] ${isActive
                    ? 'bg-elite-accent-cyan/20 text-elite-accent-cyan scale-105 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 active:scale-95'
                    }`}
            >
                <div className={`p-1 rounded-lg transition-all duration-300 ${isActive ? 'bg-elite-accent-cyan/10 ring-1 ring-elite-accent-cyan/30' : 'group-hover:scale-110'}`}>
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-[7px] font-black uppercase tracking-wider">{label}</span>
                {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-elite-accent-cyan animate-pulse" />
                )}
            </button>
        );
    };

    return (
        <div className="w-full h-full min-h-0 flex flex-col items-center bg-slate-950/20 rounded-3xl overflow-hidden border border-white/5 relative shadow-2xl">
            {/* Control Center - Premium Toolbar */}
            <div className="w-full px-3 py-2 border-b border-white/5 bg-slate-900/70 backdrop-blur-3xl sticky top-0 z-[100] flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner overflow-x-auto max-w-full flex-1">
                    <ToolButton id="select" icon={Search} label="Select" title="Select & Move Objects" />
                    <div className="w-px h-8 bg-white/5 mx-1" />
                    <ToolButton id="draw" icon={Wand2} label="Draw" title="Freehand Annotation" />
                    <ToolButton id="highlight" icon={Zap} label="Markup" title="Text Highlighter" />
                    <ToolButton id="text" icon={Type} label="Text" title="Rich Text Tool" />
                    <div className="w-px h-8 bg-white/5 mx-1" />
                    <ToolButton id="rect" icon={Square} label="Box" title="Geometry: Rect" />
                    <ToolButton id="circle" icon={Circle} label="Circle" title="Geometry: Circle" />
                    <ToolButton id="triangle" icon={Triangle} label="Tri" title="Geometry: Triangle" />
                    <ToolButton id="star" icon={Star} label="Star" title="Geometry: Star" />
                    <ToolButton id="check" icon={Check} label="Check" title="Symbol: Check" />
                    <ToolButton id="cross" icon={X} label="Cross" title="Symbol: X" />
                    <ToolButton id="arrow" icon={ArrowRight} label="Arrow" title="Geometry: Arrow" />
                </div>

                {/* Color Palette */}
                <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 shrink-0">
                    {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#000000'].map(color => (
                        <button
                            key={color}
                            onClick={() => setActiveColor(color)}
                            className={`w-4 h-4 rounded-full transition-all border-2 ${activeColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                {/* Markup Stamps */}
                <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
                    {[
                        { text: 'APPROVED', color: '#10b981' },
                        { text: 'DRAFT', color: '#f59e0b' },
                        { text: 'REJECTED', color: '#ef4444' },
                        { text: 'SIGN HERE', color: '#3b82f6', icon: true }
                    ].map(stamp => (
                        <button
                            key={stamp.text}
                            onClick={() => {
                                if (!fabricCanvas.current) return;
                                const text = new IText(stamp.text, {
                                    left: width / 2,
                                    top: height / 2,
                                    fontSize: stamp.icon ? 32 : 40,
                                    fill: stamp.color,
                                    fontFamily: 'Impact, sans-serif',
                                    fontWeight: 'bold',
                                    angle: -20,
                                    opacity: 0.6,
                                    stroke: stamp.color,
                                    strokeWidth: 2,
                                    padding: 10,
                                    textAlign: 'center'
                                });
                                fabricCanvas.current.add(text);
                                fabricCanvas.current.centerObject(text);
                                fabricCanvas.current.setActiveObject(text);
                                fabricCanvas.current.renderAll();
                            }}
                            className="px-2 py-1 rounded-md border border-white/10 hover:bg-white/5 text-[7px] font-black text-white/70 flex items-center gap-1"
                        >
                            {stamp.icon && <PenTool className="w-2 h-2" />}
                            {stamp.text}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                    {ocrAction && (
                        <button
                            onClick={ocrAction.onClick}
                            disabled={ocrAction.loading}
                            className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white font-black text-[8px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/30"
                        >
                            {ocrAction.loading ? (
                                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" /></svg>
                            )}
                            OCR
                        </button>
                    )}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => {
                                setFitMode('page');
                                requestAnimationFrame(() => recalcZoom('page'));
                            }}
                            className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${fitMode === 'page' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Fit Page
                        </button>
                        <button
                            onClick={() => {
                                setFitMode('width');
                                requestAnimationFrame(() => recalcZoom('width'));
                            }}
                            className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${fitMode === 'width' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Fit Width
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                        <button
                            onClick={() => {
                                setFitMode('manual');
                                pendingScrollReset.current = false;
                                setZoom(z => Math.max(0.1, z - 0.1));
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                            <span className="text-lg leading-none">−</span>
                        </button>
                        <span className="text-[9px] font-black text-white/50 w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => {
                                setFitMode('manual');
                                pendingScrollReset.current = false;
                                setZoom(z => Math.min(4.5, z + 0.1));
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                        >
                            <span className="text-lg leading-none">+</span>
                        </button>
                    </div>
                    <div className="w-px h-8 bg-white/5 hidden sm:block" />
                    <button
                        onClick={deleteSelection}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all active:scale-95 group"
                        title="Delete Selection"
                    >
                        <Trash2 className="h-4 w-4 group-hover:shake" />
                    </button>
                    <button
                        onClick={() => {
                            if (!fabricCanvas.current) return;
                            const objects = fabricCanvas.current.getObjects();
                            objects.forEach(obj => {
                                if ((obj as any).id !== 'pdf-page-bg') {
                                    fabricCanvas.current?.remove(obj);
                                }
                            });
                            fabricCanvas.current.renderAll();
                        }}
                        className="p-2.5 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl border border-white/10 transition-all text-[8px] font-black uppercase tracking-widest px-4"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Document Workspace */}
            <div ref={containerRef} className="flex-1 w-full min-h-[60vh] h-full flex items-start justify-start p-1.5 sm:p-2 bg-elite-bg/10 overflow-auto relative custom-scrollbar">
                <div
                    className="mx-auto my-auto shadow-[0_20px_70px_rgba(0,0,0,0.6)] bg-white border border-slate-200/50 rounded-sm overflow-hidden transition-all duration-300 ease-out will-change-transform flex items-center justify-center ring-1 ring-white/10"
                    style={{
                        width: width * zoom,
                        height: height * zoom,
                        minWidth: width * zoom,
                        minHeight: height * zoom,
                        transform: 'none',
                        isolation: 'isolate'
                    }}
                >
                    <canvas ref={canvasRef} className="w-full h-full block border border-slate-100" />
                </div>
            </div>

            {/* Status Bar */}
            <div className="w-full px-4 py-1 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Protocol Secure</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">100% Client-Side Protocol</span>
            </div>
        </div>
    );
};
