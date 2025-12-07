'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect, useState } from 'react';

interface ContentEditorProps {
    content: string;
    onChange: (content: string) => void;
    onSave: () => void;
    placeholder?: string;
    editable?: boolean;
}

export function ContentEditor({
    content,
    onChange,
    onSave,
    placeholder = 'Bắt đầu viết nội dung...',
    editable = true,
}: ContentEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px]',
            },
        },
    });

    // Auto-save functionality
    useEffect(() => {
        if (!editor) return;

        const saveTimer = setTimeout(() => {
            if (editor.getHTML() !== content) {
                handleSave();
            }
        }, 2000); // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(saveTimer);
    }, [editor?.getHTML()]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await onSave();
            setLastSaved(new Date());
        } finally {
            setIsSaving(false);
        }
    }, [onSave]);

    // Keyboard shortcut for save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    if (!editor) {
        return (
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
        );
    }

    return (
        <div className="content-editor">
            {/* Toolbar */}
            <div className="border-b pb-3 mb-4 flex flex-wrap gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <s>S</s>
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    H3
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    • List
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    1. List
                </ToolbarButton>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    ❝
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code Block"
                >
                    {'</>'}
                </ToolbarButton>

                <div className="flex-1"></div>

                {/* Save status */}
                <div className="flex items-center text-xs text-gray-400">
                    {isSaving ? (
                        <span className="flex items-center gap-1">
                            <span className="animate-spin">⏳</span> Đang lưu...
                        </span>
                    ) : lastSaved ? (
                        <span>Đã lưu {formatTime(lastSaved)}</span>
                    ) : (
                        <span>Ctrl+S để lưu</span>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="editor-content" />

            <style jsx global>{`
        .editor-content .ProseMirror {
          min-height: 300px;
          font-family: 'Times New Roman', serif;
          font-size: 14pt;
          line-height: 1.5;
        }

        .editor-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .editor-content .ProseMirror h2 {
          font-size: 16pt;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .editor-content .ProseMirror h3 {
          font-size: 14pt;
          font-weight: bold;
          font-style: italic;
          margin-top: 0.8em;
          margin-bottom: 0.4em;
        }

        .editor-content .ProseMirror blockquote {
          border-left: 3px solid #e2e8f0;
          padding-left: 1em;
          color: #64748b;
          font-style: italic;
        }

        .editor-content .ProseMirror ul,
        .editor-content .ProseMirror ol {
          padding-left: 1.5em;
        }

        .editor-content .ProseMirror code {
          background: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }

        .editor-content .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
        }
      `}</style>
        </div>
    );
}

function ToolbarButton({
    onClick,
    isActive,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-100 transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                }`}
        >
            {children}
        </button>
    );
}

function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
        return 'vừa xong';
    }
    if (diff < 3600000) {
        return `${Math.floor(diff / 60000)} phút trước`;
    }
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
