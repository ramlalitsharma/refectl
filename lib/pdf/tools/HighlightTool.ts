import { TEvent, Rect } from 'fabric';
import { AbstractPdfTool } from '../AbstractPdfTool';

export class HighlightTool extends AbstractPdfTool {
    activate(): void {
        this.canvas.isDrawingMode = false;
        this.canvas.defaultCursor = 'text';
        this.applySettings();
    }

    protected applySettings(): void {
        // No-op for now as we set on mousedown
    }

    onMouseDown(e: TEvent): void {
        super.onMouseDown(e);
        const pointer = this.canvas.getScenePoint(e.e);

        // Convert hex to rgba for highlight
        let color = this.strokeColor;
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            color = `rgba(${r}, ${g}, ${b}, 0.3)`;
        }

        this.activeObject = new Rect({
            left: pointer.x,
            top: pointer.y,
            fill: color,
            width: 1,
            height: 20,
            selectable: true,
            transparentCorners: false
        });

        this.canvas.add(this.activeObject);
    }

    onMouseMove(e: TEvent): void {
        if (!this.isDrawing || !this.activeObject) return;
        const pointer = this.canvas.getScenePoint(e.e);

        const width = pointer.x - (this.activeObject.left || 0);
        const height = pointer.y - (this.activeObject.top || 0);

        this.activeObject.set({
            width: Math.abs(width),
            height: Math.abs(height)
        });

        if (width < 0) this.activeObject.set({ left: pointer.x });
        if (height < 0) this.activeObject.set({ top: pointer.y });

        this.canvas.renderAll();
    }
}
