'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  height = 240,
  disabled = false,
}: MarkdownEditorProps) {
  const editorValue = useMemo(() => value || '', [value]);

  return (
    <div data-color-mode="light">
      <MDEditor
        value={editorValue}
        preview="edit"
        visibleDragbar={false}
        height={height}
        textareaProps={{ placeholder }}
        onChange={(next) => onChange(next || '')}
        hideToolbar={false}
        disablePreview={false}
        data-testid="markdown-editor"
        readOnly={disabled}
      />
    </div>
  );
}

