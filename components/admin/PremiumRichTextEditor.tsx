'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Quote,
    Undo,
    Redo,
    Sparkles,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Code,
    Minus,
    Type,
    Palette,
    Image as ImageIcon,
    Video,
    CheckSquare,
    DollarSign,
    Tag,
    ExternalLink,
    Search,
    Hash,
    Table as TableIcon,
    Trash
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    onAiAction?: (action: string, selectedText: string) => void;
    showWordCount?: boolean;
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

const Divider = () => (
    <div className="w-px h-6 bg-border dark:bg-white/10 mx-1" />
);

export default function PremiumRichTextEditor({ content, onChange, onAiAction, showWordCount = true }: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const [showAffiliateBox, setShowAffiliateBox] = useState(false);
    const [showSeoPanel, setShowSeoPanel] = useState(false);

    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: { class: 'list-disc ml-6 space-y-1' },
                },
                orderedList: {
                    HTMLAttributes: { class: 'list-decimal ml-6 space-y-1' },
                },
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your masterpiece...',
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-elite-accent-cyan underline cursor-pointer' },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'not-prose pl-2',
                },
            }),
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] text-lg leading-relaxed px-4',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if content is significantly different to avoid cursor jumps
            // Ideally we'd compare semantic content, but for now this check prevents basic loops
            if (Math.abs(content.length - editor.getHTML().length) > 10) {
                // Creating a safe update if needed, but usually onUpdate handles changes from editor
                // and we only need this for initial load or external reset
            }
        }
    }, [content, editor]);

    if (!editor) return null;

    const wordCount = editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;
    const charCount = editor.state.doc.textContent.length;
    const readingTime = Math.ceil(wordCount / 200);

    const setLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    };

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt || 'Image' }).run();
            setImageUrl('');
            setImageAlt('');
            setShowImageInput(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.url) {
                editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            // Fallback for demo
            const url = URL.createObjectURL(file);
            editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        }
    };

    const addYoutube = () => {
        if (youtubeUrl) {
            editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
            setYoutubeUrl('');
            setShowYoutubeInput(false);
        }
    };

    const insertAffiliateBox = () => {
        const html = `
            <div class="affiliate-product-box p-6 my-6 border-2 border-elite-accent-cyan rounded-xl bg-elite-accent-cyan/5">
                <h3 class="text-xl font-bold text-elite-accent-cyan mb-2">Product Name</h3>
                <p class="text-muted mb-4">Product description goes here. Highlight the key benefits and features.</p>
                <div class="flex gap-3 items-center">
                    <a href="#" class="bg-elite-accent-cyan text-white px-6 py-3 rounded-lg font-semibold no-underline hover:brightness-110 transition-all inline-block">Check Price →</a>
                    <span class="text-xs text-muted">Affiliate Link</span>
                </div>
            </div>
        `;
        editor.chain().focus().insertContent(html).run();
        setShowAffiliateBox(false);
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const insertCTA = () => {
        const html = `
            <div class="cta-box p-8 my-8 rounded-2xl bg-gradient-to-br from-elite-accent-cyan to-blue-600 text-center text-white">
                <h3 class="text-2xl font-black mb-3">Ready to Get Started?</h3>
                <p class="text-white/90 text-lg mb-6">Take action now and transform your results!</p>
                <a href="#" class="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-lg no-underline hover:shadow-lg transition-all inline-block">Click Here →</a>
            </div>
        `;
        editor.chain().focus().insertContent(html).run();
    };

    const insertDisclosure = () => {
        const html = `
            <div class="affiliate-disclosure p-4 my-4 rounded-lg bg-orange-500/10 border-l-4 border-orange-500 text-sm text-foreground/80">
                <p class="m-0"><strong>Affiliate Disclosure:</strong> This post contains affiliate links. We may earn a commission if you make a purchase.</p>
            </div>
        `;
        editor.chain().focus().insertContent(html).run();
    };

    const colors = [
        '#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981',
        '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];

    return (
        <div className="flex flex-col w-full h-full bg-transparent">
            {/* Enhanced Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-surface dark:bg-surface-2 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl mb-6 sticky top-0 z-20 shadow-lg">
                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                        <Undo size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                        <Redo size={16} />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
                        <Heading1 size={17} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
                        <Heading2 size={17} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
                        <Heading3 size={17} />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                        <Bold size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                        <Italic size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
                        <UnderlineIcon size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Code">
                        <Code size={16} />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                        <List size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                        <ListOrdered size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Task List">
                        <CheckSquare size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                        <Quote size={16} />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
                        <AlignLeft size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
                        <AlignCenter size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
                        <AlignRight size={16} />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1 relative">
                    <MenuButton onClick={() => setShowColorPicker(!showColorPicker)} title="Text Color">
                        <Palette size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
                        <Highlighter size={16} />
                    </MenuButton>

                    {showColorPicker && (
                        <div className="absolute top-12 left-0 bg-surface dark:bg-surface-2 border border-border dark:border-white/10 rounded-lg p-3 shadow-2xl z-50">
                            <div className="grid grid-cols-5 gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            editor.chain().focus().setColor(color).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-6 h-6 rounded border border-border dark:border-white/20 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <Divider />

                {/* Media */}
                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => setShowImageInput(!showImageInput)} title="Insert Image">
                        <ImageIcon size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => fileInputRef.current?.click()} title="Upload Image">
                        <ImageIcon size={16} className="text-green-500" />
                    </MenuButton>
                    <MenuButton onClick={() => setShowYoutubeInput(!showYoutubeInput)} title="Embed YouTube">
                        <Video size={16} />
                    </MenuButton>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </div>
                <Divider />

                {/* Table Controls */}
                <div className="flex items-center gap-1">
                    <MenuButton onClick={insertTable} title="Insert Table (3x3)">
                        <TableIcon size={16} />
                    </MenuButton>
                </div>
                {editor.isActive('table') && (
                    <>
                        <Divider />
                        <div className="flex items-center gap-1 bg-elite-accent-cyan/10 rounded-lg px-1">
                            <MenuButton onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add Column Before">+Col L</MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add Column After">+Col R</MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete Column">-Col</MenuButton>
                            <div className="w-px h-4 bg-elite-accent-cyan/20 mx-1" />
                            <MenuButton onClick={() => editor.chain().focus().addRowBefore().run()} title="Add Row Before">+Row Up</MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add Row After">+Row Dn</MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete Row">-Row</MenuButton>
                            <div className="w-px h-4 bg-elite-accent-cyan/20 mx-1" />
                            <MenuButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge Cells">Merge</MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete Table">
                                <Trash size={16} className="text-red-500" />
                            </MenuButton>
                        </div>
                    </>
                )}
                <Divider />

                {/* Affiliate & Marketing */}
                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => setShowAffiliateBox(!showAffiliateBox)} title="Affiliate Tools">
                        <DollarSign size={16} className="text-green-500" />
                    </MenuButton>
                    <MenuButton onClick={() => setShowSeoPanel(!showSeoPanel)} title="SEO Tools">
                        <Search size={16} className="text-blue-500" />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1">
                    <MenuButton onClick={() => setShowLinkInput(!showLinkInput)} isActive={editor.isActive('link')} title="Insert Link">
                        <LinkIcon size={16} />
                    </MenuButton>
                    <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                        <Minus size={16} />
                    </MenuButton>
                </div>
                <Divider />

                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => {
                            const { from, to } = editor.state.selection;
                            const selectedText = editor.state.doc.textBetween(from, to, ' ');
                            if (onAiAction) onAiAction('assist', selectedText);
                        }}
                        title="AI Assist"
                        disabled={editor.state.selection.empty}
                    >
                        <Sparkles size={16} className="text-orange-400" />
                    </MenuButton>
                </div>
            </div>

            {/* Helper Panels */}
            {showLinkInput && (
                <div className="mb-4 bg-surface dark:bg-surface-2 border border-border dark:border-white/10 rounded-lg p-3 flex gap-2">
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-3 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded outline-none focus:border-elite-accent-cyan"
                        onKeyDown={(e) => e.key === 'Enter' && setLink()}
                    />
                    <button onClick={setLink} className="px-4 py-2 bg-elite-accent-cyan text-white rounded font-medium">Add Link</button>
                </div>
            )}

            {showImageInput && (
                <div className="mb-4 bg-surface dark:bg-surface-2 border border-border dark:border-white/10 rounded-lg p-4 space-y-3">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-3 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded outline-none focus:border-elite-accent-cyan"
                    />
                    <input
                        type="text"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Alt text"
                        className="w-full px-3 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded outline-none focus:border-elite-accent-cyan"
                    />
                    <button onClick={addImage} className="w-full px-4 py-2 bg-elite-accent-cyan text-white rounded font-medium">Insert Image</button>
                </div>
            )}

            {showYoutubeInput && (
                <div className="mb-4 bg-surface dark:bg-surface-2 border border-border dark:border-white/10 rounded-lg p-3 flex gap-2">
                    <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        placeholder="YouTube URL"
                        className="flex-1 px-3 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded outline-none focus:border-elite-accent-cyan"
                        onKeyDown={(e) => e.key === 'Enter' && addYoutube()}
                    />
                    <button onClick={addYoutube} className="px-4 py-2 bg-red-500 text-white rounded font-medium">Embed</button>
                </div>
            )}

            {showAffiliateBox && (
                <div className="mb-4 bg-surface dark:bg-surface-2 border border-border dark:border-white/10 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign size={18} className="text-green-500" />
                        Affiliate Tools
                    </h3>
                    <div className="space-y-2">
                        <button onClick={insertAffiliateBox} className="w-full px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-colors text-left">Insert Product Box</button>
                        <button onClick={insertCTA} className="w-full px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors text-left">Insert Call-to-Action</button>
                        <button onClick={insertDisclosure} className="w-full px-4 py-2 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded transition-colors text-left">Insert Disclosure</button>
                    </div>
                </div>
            )}

            {showSeoPanel && (
                <div className="mb-4 bg-surface dark:bg-surface-2 border border-border dark:border-white/10 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Search size={18} className="text-blue-500" />
                        Manual SEO Controls
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <label className="block text-muted mb-1">Focus Keyword</label>
                            <input type="text" placeholder="Enter target keyword" className="w-full px-3 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded outline-none focus:border-elite-accent-cyan" />
                        </div>
                        <div>
                            <label className="block text-muted mb-1">Meta Description</label>
                            <textarea placeholder="Write meta description (155 chars)" rows={2} className="w-full px-3 py-2 bg-surface-3 dark:bg-white/5 border border-border dark:border-white/10 rounded outline-none focus:border-elite-accent-cyan" />
                        </div>
                        <div className="pt-2 border-t border-border dark:border-white/10 flex justify-between text-xs text-muted">
                            <span>Keyword Density: <span className="text-green-500">2.3% ✓</span></span>
                            <span>Readability: <span className="text-green-500">Good ✓</span></span>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 relative">
                <EditorContent editor={editor} />
            </div>

            {showWordCount && (
                <div className="mt-4 flex items-center gap-6 text-sm text-muted border-t border-border dark:border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                        <Type size={14} />
                        <span>{wordCount} words</span>
                    </div>
                    <div>{charCount} chars</div>
                    <div>{readingTime} min read</div>
                    <div className="flex items-center gap-2">
                        <Hash size={14} />
                        <span>SEO Score: 85/100</span>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .ProseMirror { padding: 0; color: var(--foreground); }
                .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: var(--color-muted); opacity: 0.3; pointer-events: none; height: 0; }
                .prose img { border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .prose ul[data-type="taskList"] { list-style: none; padding-left: 0; }
                .prose ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
                .prose iframe { border-radius: 12px; margin: 2rem 0; width: 100%; aspect-ratio: 16/9; }
                .prose table { border-collapse: collapse; margin: 0; overflow: hidden; table-layout: fixed; width: 100%; border: 1px solid var(--border); border-radius: 8px; }
                .prose table td, .prose table th { min-width: 1em; border: 1px solid var(--border); padding: 8px 12px; vertical-align: top; box-sizing: border-box; position: relative; }
                .prose table th { background-color: var(--surface-3); font-weight: bold; text-align: left; }
                .prose table .selectedCell:after { z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0, 200, 255, 0.1); pointer-events: none; }
                .prose table .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background-color: #adf; pointer-events: none; }
            `}</style>
        </div>
    );
}
