import { DigitalWhiteboard } from '@/components/learning/DigitalWhiteboard';

export default function WhiteboardToolPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Digital Whiteboard</h1>
            <p className="mb-6 text-slate-600">
                Sketch diagrams, solve math problems, or take visual notes. Save your work to your device when done.
            </p>
            <DigitalWhiteboard height="600px" />
        </div>
    );
}
