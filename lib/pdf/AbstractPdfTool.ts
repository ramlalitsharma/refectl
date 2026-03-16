import { Canvas, FabricObject, TEvent } from 'fabric';

export abstract class AbstractPdfTool {
    protected canvas: Canvas;
    protected isDrawing: boolean = false;
    protected activeObject: any = null;
    protected strokeColor: string = '#ef4444';
    protected strokeWidth: number = 3;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
    }

    setStrokeSettings(color: string, width: number): void {
        this.strokeColor = color;
        this.strokeWidth = width;
        this.applySettings();
    }

    protected applySettings(): void {
        // Implement in subclasses if needed
    }

    /**
     * Called when the tool is selected from the toolbar.
     */
    abstract activate(): void;

    /**
     * Called when the tool is deselected or another tool is picked.
     */
    abstract deactivate(): void;

    /**
     * Lifecycle methods for canvas interaction.
     */
    onMouseDown(e: TEvent): void {
        this.isDrawing = true;
    }

    onMouseMove(e: TEvent): void {
        if (!this.isDrawing) return;
    }

    onMouseUp(e: TEvent): void {
        this.isDrawing = false;
        this.activeObject = null;
    }

    /**
     * Utility to generate unique IDs for annotations.
     */
    protected generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}
