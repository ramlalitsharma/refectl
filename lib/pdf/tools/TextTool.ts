import { TEvent, IText } from 'fabric';
import { AbstractPdfTool } from '../AbstractPdfTool';

export class TextTool extends AbstractPdfTool {
    activate(): void {
        this.canvas.isDrawingMode = false;
        this.canvas.defaultCursor = 'text';
    }

    deactivate(): void {
        this.canvas.defaultCursor = 'default';
    }

    onMouseDown(e: TEvent): void {
        const pointer = this.canvas.getScenePoint(e.e);

        // Check if we already clicked on a text object
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) return;

        const text = new IText('Type something...', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: this.strokeColor,
            fontFamily: 'Inter, sans-serif',
            selectable: true,
            hasControls: true
        });

        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        text.enterEditing();
    }

    deactivate(): void {
        this.canvas.defaultCursor = 'default';
        const active = this.canvas.getActiveObject();
        if (active && (active as any).isEditing) {
            (active as any).exitEditing();
        }
    }
}
