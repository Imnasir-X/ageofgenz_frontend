import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading2, Heading3, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Undo2, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeArticleHtml } from '../lib/sanitize';

function ToolButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded text-muted-foreground transition-colors duration-fast ease-standard hover:bg-muted hover:text-foreground disabled:opacity-40 sm:size-8 [&_svg]:size-4',
        active && 'bg-mist text-secondary-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL (https://...)', previous ?? 'https://');
    if (url === null) return;
    if (!url || url === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 border-b bg-card/95 px-2 py-1 backdrop-blur" role="toolbar" aria-label="Formatting">
      <ToolButton label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolButton>
      <ToolButton label="Subheading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <ToolButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolButton>
      <ToolButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolButton>
      <ToolButton label="Link" active={editor.isActive('link')} onClick={setLink}><Link2 /></ToolButton>
      <ToolButton label="Remove link" disabled={!editor.isActive('link')} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink /></ToolButton>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <ToolButton label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolButton>
      <ToolButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolButton>
      <ToolButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></ToolButton>
      <span className="ml-auto flex">
        <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></ToolButton>
        <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></ToolButton>
      </span>
    </div>
  );
}

/**
 * Rich text body editor (TipTap). Output is sanitized with the article allow-list before it
 * leaves the component, so only safe HTML is ever saved.
 */
export function RichTextEditor({ value, onChange, label }: { value: string; onChange: (html: string) => void; label: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        'aria-label': label,
        class: 'prose prose-neutral max-w-none px-4 py-4 font-serif text-[1.075rem] leading-relaxed outline-none dark:prose-invert prose-headings:font-display prose-a:text-primary min-h-[22rem]',
      },
    },
    onUpdate: ({ editor: e }) => onChange(sanitizeArticleHtml(e.getHTML())),
  });

  // Replace the content when a different article loads (not on every keystroke).
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value && !editor.isFocused) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="overflow-hidden rounded-lg border bg-card focus-within:ring-2 focus-within:ring-ring">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
