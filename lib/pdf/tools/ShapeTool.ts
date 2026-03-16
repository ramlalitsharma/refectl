import { TEvent, Rect, Path, Circle, Triangle } from 'fabric';
import { AbstractPdfTool } from '../AbstractPdfTool';

export type ShapeType = 'rect' | 'arrow' | 'circle' | 'triangle' | 'star' | 'check' | 'cross';

export class ShapeTool extends AbstractPdfTool {
    private type: ShapeType;

    constructor(canvas: any, type: ShapeType) {
        super(canvas);
        this.type = type;
    }

    activate(): void {
        this.canvas.isDrawingMode = false;
        this.canvas.defaultCursor = 'crosshair';
    }

    deactivate(): void {
        this.canvas.defaultCursor = 'default';
    }

    onMouseDown(e: TEvent): void {
        super.onMouseDown(e);
        const pointer = this.canvas.getScenePoint(e.e);

        const common = {
            left: pointer.x,
            top: pointer.y,
            stroke: this.strokeColor,
            strokeWidth: this.strokeWidth,
            fill: 'transparent',
            selectable: true,
            originX: 'center',
            originY: 'center',
            strokeUniform: true
        } as any;

        if (this.type === 'rect') {
            this.activeObject = new Rect({ ...common, width: 1, height: 1, originX: 'left', originY: 'top' });
        } else if (this.type === 'circle') {
            this.activeObject = new Circle({ ...common, radius: 1 });
        } else if (this.type === 'triangle') {
            this.activeObject = new Triangle({ ...common, width: 1, height: 1 });
        } else if (this.type === 'star') {
            this.activeObject = new Path('M 0 -10 L 2.35 -3.27 L 9.51 -3.27 L 3.71 0.95 L 5.88 7.73 L 0 3.5 L -5.88 7.73 L -3.71 0.95 L -9.51 -3.27 L -2.35 -3.27 Z', {
                ...common,
                scaleX: 0.1,
                scaleY: 0.1
            });
        } else if (this.type === 'check') {
            this.activeObject = new Path('M -10 0 L -2 8 L 10 -8', {
                ...common,
                scaleX: 0.1,
                scaleY: 0.1
            });
        } else if (this.type === 'cross') {
            this.activeObject = new Path('M -8 -8 L 8 8 M 8 -8 L -8 8', {
                ...common,
                scaleX: 0.1,
                scaleY: 0.1
            });
        } else if (this.type === 'arrow') {
            this.activeObject = new Path('M 0 0 L 20 0 M 20 0 L 15 -5 M 20 0 L 15 5', {
                ...common,
                originX: 'left',
                originY: 'top'
            });
        }

        if (this.activeObject) {
            this.canvas.add(this.activeObject);
        }
    }

    onMouseMove(e: TEvent): void {
        if (!this.isDrawing || !this.activeObject) return;
        const pointer = this.canvas.getScenePoint(e.e);
        const startX = this.activeObject.left || 0;
        const startY = this.activeObject.top || 0;
        const dx = pointer.x - startX;
        const dy = pointer.y - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (this.type === 'rect' || this.type === 'triangle') {
            this.activeObject.set({
                width: Math.abs(dx),
                height: Math.abs(dy)
            });
            // Handle reverse drag for rect/tri
            if (dx < 0 && this.type === 'rect') this.activeObject.set({ originX: 'right' });
            if (dy < 0 && this.type === 'rect') this.activeObject.set({ originY: 'bottom' });
        } else if (this.type === 'circle') {
            this.activeObject.set({ radius: dist });
        } else if (this.type === 'star' || this.type === 'check' || this.type === 'cross') {
            this.activeObject.set({
                scaleX: dist / 10,
                scaleY: dist / 10,
                angle: Math.atan2(dy, dx) * (180 / Math.PI)
            });
        } else if (this.type === 'arrow') {
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const length = Math.sqrt(dx * dx + dy * dy);
            this.activeObject.set({
                angle: angle,
                scaleX: length / 20,
                scaleY: length / 20
            });
        }

        this.canvas.renderAll();
    }
}
