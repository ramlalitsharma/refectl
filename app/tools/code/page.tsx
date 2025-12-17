import { CodePlayground } from '@/components/learning/CodePlayground';

export default function CodeToolPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Interactive Coding Playground</h1>
            <p className="mb-6 text-slate-600">
                Test your JavaScript algorithms in real-time. This playground executes within your browser environment.
            </p>
            <CodePlayground height="600px" />
        </div>
    );
}
