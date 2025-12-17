'use client';

import { useRef, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { Button } from '@/components/ui/Button';
import { Download, Eraser, Pen, RotateCcw, Save } from 'lucide-react';

interface DigitalWhiteboardProps {
    initialImage?: string;
    onSave?: (imageData: string) => void;
    height?: string;
}

export function DigitalWhiteboard({ onSave, height = '500px' }: DigitalWhiteboardProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [eraseMode, setEraseMode] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(4);

    const handleClear = () => {
        canvasRef.current?.clearCanvas();
    };

    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    const handleSave = async () => {
        if (canvasRef.current) {
            // Export as Image
            const dataUrl = await canvasRef.current.exportImage('png');
            if (onSave) onSave(dataUrl);

            // Trigger generic download for user
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `whiteboard-${Date.now()}.png`;
            link.click();
        }
    };

    return (
        <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
                    <button
                        onClick={() => setEraseMode(false)}
                        className={`p-2 rounded ${!eraseMode ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-100'}`}
                        title="Pen"
                    >
                        <Pen size={18} />
                    </button>
                    <button
                        onClick={() => setEraseMode(true)}
                        className={`p-2 rounded ${eraseMode ? 'bg-teal-50 text-teal-600' : 'text-slate-500 hover:bg-slate-100'}`}
                        title="Eraser"
                    >
                        <Eraser size={18} />
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-300 mx-1" />

                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 font-medium">Color</label>
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        disabled={eraseMode}
                        className="h-8 w-8 cursor-pointer rounded border-0 p-0"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500 font-medium">Size</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-24"
                    />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleUndo} title="Undo">
                        <RotateCcw size={16} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClear}>
                        Clear
                    </Button>
                    <Button variant="inverse" size="sm" onClick={handleSave} className="gap-2">
                        <Save size={16} /> Save
                    </Button>
                </div>
            </div>

            <div style={{ height, width: '100%' }} className="relative bg-white cursor-crosshair">
                <ReactSketchCanvas
                    ref={canvasRef}
                    strokeWidth={strokeWidth}
                    strokeColor={strokeColor}
                    eraserWidth={strokeWidth * 2}
                    canvasColor="transparent"
                    style={{ border: 'none' }}
                    backgroundImage="https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png" // Trick for transparent feel or just simple white
                />
                {/* Grid Background Pattern */}
                <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
        </div>
    );
}
