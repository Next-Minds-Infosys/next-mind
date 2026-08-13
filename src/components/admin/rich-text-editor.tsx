"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  TableOfContents,
  getHierarchicalIndexes,
  type TableOfContentData,
} from "@tiptap/extension-table-of-contents";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";
import {
  Bold,
  Italic,
  Strikethrough,
  UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  LinkIcon,
  Unlink,
  ImageIcon,
  ListTree,
  Undo2,
  Redo2,
} from "lucide-react";

// tiptap-markdown never merges its storage into @tiptap/core's `Storage`
// interface, and core's bundled .d.ts declares `interface Storage {}` without
// exporting it - so it cannot be augmented. Narrow at the access point.
function getMarkdown(editor: Editor): string {
  return (editor.storage as unknown as { markdown: MarkdownStorage }).markdown.getMarkdown();
}

interface RichTextEditorProps {
  /** Markdown in, markdown out - the DB column is `contentMd`. */
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function TocButton({ editor, tocItems }: { editor: Editor; tocItems: TableOfContentData }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <ToolbarButton label="Table of contents" active={open} onClick={() => setOpen((o) => !o)}>
        <ListTree size={15} />
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-lg bg-white p-2 shadow-lg ring-1 ring-gray-950/10">
          {tocItems.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-gray-400">
              Add an H2 or H3 to build an outline.
            </p>
          ) : (
            <ul className="max-h-64 space-y-0.5 overflow-y-auto">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus().setTextSelection(item.pos).scrollIntoView().run();
                      setOpen(false);
                    }}
                    className={`block w-full truncate rounded-md py-1.5 pr-2 text-left text-sm text-gray-700 hover:bg-gray-50 ${
                      item.level >= 3 ? "pl-6" : "pl-2"
                    }`}
                  >
                    {item.textContent || "Untitled heading"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Toolbar({ editor, tocItems }: { editor: Editor; tocItems: TableOfContentData }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-950/5 px-2 py-1.5">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-950/10" />

      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-950/10" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={15} />
      </ToolbarButton>
      <TocButton editor={editor} tocItems={tocItems} />

      <span className="mx-1 h-5 w-px bg-gray-950/10" />

      <ToolbarButton
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const previous = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link URL", previous ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <LinkIcon size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Unlink size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Insert image"
        onClick={() => {
          const url = window.prompt("Image URL");
          if (!url) return;
          const alt = window.prompt("Alt text (for SEO and accessibility)") ?? "";
          editor.chain().focus().setImage({ src: url, alt }).run();
        }}
      >
        <ImageIcon size={15} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-gray-950/10" />

      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={15} />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [tocItems, setTocItems] = useState<TableOfContentData>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder }),
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate: (content) => setTocItems(content),
      }),
      Markdown.configure({ html: false, transformPastedText: true, linkify: true }),
    ],
    content: value,
    // Required in Next.js: rendering on the server would mismatch on hydration.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-[220px] max-h-[520px] overflow-y-auto px-4 py-3 text-sm text-gray-800 focus:outline-none " +
          // The editor is a contenteditable, so node styling is applied here
          // rather than relying on a typography plugin (not installed).
          "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-gray-900 " +
          "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 " +
          "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 " +
          "[&_p]:my-2 [&_p]:leading-relaxed " +
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 " +
          "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-500/40 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 " +
          "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-gray-900 [&_pre]:p-3 [&_pre]:text-xs [&_pre]:text-gray-100 " +
          "[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em] " +
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit " +
          "[&_hr]:my-4 [&_hr]:border-gray-950/10 " +
          "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg " +
          "[&_strong]:font-semibold [&_a]:text-teal-600 [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(getMarkdown(editor));
    },
  });

  // Re-sync when the form is reused for a different course. Guarded so typing
  // does not fight the editor's own state.
  useEffect(() => {
    if (!editor) return;
    if (value !== getMarkdown(editor)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[262px] animate-pulse rounded-lg bg-gray-50 ring-1 ring-gray-950/5" />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white ring-1 ring-gray-950/5 transition focus-within:ring-2 focus-within:ring-teal-500">
      <Toolbar editor={editor} tocItems={tocItems} />
      <EditorContent editor={editor} />
    </div>
  );
}
