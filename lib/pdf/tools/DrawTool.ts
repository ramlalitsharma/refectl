import { TEvent } from 'fabric';
import { AbstractPdfTool } from '../AbstractPdfTool';

export class DrawTool extends AbstractPdfTool {
    activate(): void {
        this.canvas.isDrawingMode = true;
        this.applySettings();
    }

    protected applySettings(): void {
        if (this.canvas.freeDrawingBrush) {
            this.canvas.freeDrawingBrush.width = this.strokeWidth;
            this.canvas.freeDrawingBrush.color = this.strokeColor;
        }
    }

    deactivate(): void {
        this.canvas.isDrawingMode = false;
    }

    onMouseDown(e: TEvent): void {
        // Fabric handles free drawing automatically when isDrawingMode is true
    }
}
