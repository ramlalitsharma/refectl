'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/Button';

interface CodePlaygroundProps {
    initialCode?: string;
    language?: 'javascript' | 'python' | 'html';
    height?: string;
}

export function CodePlayground({
    initialCode = '// Write your code here\nconsole.log("Hello World");',
    language = 'javascript',
    height = '400px'
}: CodePlaygroundProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const runCode = async () => {
        setIsRunning(true);
        setOutput([]); // Clear previous output

        try {
            if (language === 'javascript') {
                // Capture console.log
                const logs: string[] = [];
                const originalLog = console.log;

                console.log = (...args) => {
                    logs.push(args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' '));
                    // originalLog(...args); // Optional: keep logging to browser console
                };

                // Execute safely-ish
                try {
                    // eslint-disable-next-line no-eval
                    const result = eval(code);
                    if (result !== undefined) {
                        logs.push(`> Return: ${result}`);
                    }
                } catch (e: any) {
                    logs.push(`Error: ${e.message}`);
                }

                console.log = originalLog; // Restore
                setOutput(logs);
            } else {
                setOutput(['Language execution not yet fully implemented for web. Only JS is live.']);
            }
        } catch (err: any) {
            setOutput([`Runtime Error: ${err.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
                <div className="flex gap-2">
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Editor ({language})</span>
                </div>
                <Button size="sm" variant="inverse" onClick={runCode} disabled={isRunning}>
                    {isRunning ? 'Running...' : '▶ Run Code'}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row h-full">
                {/* Editor Area */}
                <div className="flex-1 border-r border-slate-200 min-h-[300px]">
                    <Editor
                        height={height}
                        defaultLanguage={language}
                        defaultValue={initialCode}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Console Output */}
                <div className="w-full md:w-1/3 bg-[#1e1e1e] text-white p-4 font-mono text-sm overflow-y-auto" style={{ height }}>
                    <div className="text-xs text-gray-400 mb-2 border-b border-gray-700 pb-1">CONSOLE OUTPUT</div>
                    {output.length === 0 ? (
                        <span className="text-gray-600 italic">No output yet...</span>
                    ) : (
                        output.map((line, i) => (
                            <div key={i} className="mb-1 whitespace-pre-wrap">{line}</div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
