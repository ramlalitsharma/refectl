'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Link as LinkIcon,
    Quote,
    Undo,
    Redo,
    Sparkles
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    onAiAction?: (selectedText: string) => void;
}

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}) => (
    <button
        onClick={(e) => {
            e.preventDefault();
            onClick();
        }}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-all flex items-center justify-center ${isActive
            ? 'bg-elite-accent-cyan/20 text-elite-accent-cyan shadow-sm border border-elite-accent-cyan/30'
            : 'text-muted hover:bg-surface-3 dark:hover:bg-white/5 hover:text-foreground'
            } disabled:opacity-20 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

export default function RichTextEditor({ content, onChange, onAiAction }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                    HTMLAttributes: {
                        class: 'list-disc ml-6 space-y-1',
                    },
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                    HTMLAttributes: {
                        class: 'list-decimal ml-6 space-y-1',
                    },
                },
                heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                        class: 'font-bold',
                    },
                },
            }),
            Placeholder.configure({
                placeholder: 'Write your masterpiece here...',
            }),
            Link.configure({
                openOnClick: false,
            }),
            Underline,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-lg leading-relaxed',
            },
        },
    });

    // Sync content from props if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    const handleAiAction = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (onAiAction && selectedText) {
            onAiAction(selectedText);
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-transparent">
            {/* Dynamic Floating Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-surface dark:bg-surface-2 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl mb-6 sticky top-0 z-20 w-fit shadow-lg">
                <div className="flex items-center gap-1 px-1 border-r border-border dark:border-white/10">
                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo"
                    >
                        <Undo size={16} />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo"
                    >
                        <Redo size={16} />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 px-1 border-r border-border dark:border-white/10">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 size={17} />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 size={17} />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 px-1 border-r border-border dark:border-white/10">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        title="Underline"
                    >
                        <UnderlineIcon size={16} />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 px-1 border-r border-border dark:border-white/10">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List size={16} />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered size={16} />
                    </MenuButton>
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                    >
                        <Quote size={16} />
                    </MenuButton>
                </div>

                <div className="flex items-center gap-1 px-1">
                    <MenuButton
                        onClick={handleAiAction}
                        title="AI Assist (Select text first)"
                        disabled={editor.state.selection.empty}
                    >
                        <Sparkles size={16} className="text-orange-400" />
                    </MenuButton>
                </div>
            </div>

            {/* Editor Surface */}
            <div className="flex-1 relative">
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
        .ProseMirror {
          padding: 0;
          color: var(--foreground);
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--color-muted);
          opacity: 0.3;
          pointer-events: none;
          height: 0;
        }
        .prose h1 {
          color: var(--foreground);
          font-weight: 900;
          letter-spacing: -0.025em;
          margin-bottom: 2rem;
          font-size: 3.5rem;
        }
        .prose h2 {
          color: var(--foreground);
          font-weight: 800;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }
        .prose p {
          margin-bottom: 1.5rem;
        }
        .prose blockquote {
          border-left: 2px solid var(--color-border);
          padding-left: 1.5rem;
          font-style: italic;
          color: var(--color-muted);
        }
        .prose ul, .prose ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose a {
          color: var(--elite-accent-cyan);
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}
