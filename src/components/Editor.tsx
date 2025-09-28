import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-p:my-1 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 focus:outline-none max-w-none min-h-[calc(100vh-200px)] dark:prose-invert prose-bullets:text-red-500',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-gray-300/50 hover:scrollbar-thumb-gray-400/50 scrollbar-track-transparent dark:scrollbar-thumb-gray-600/50 dark:hover:scrollbar-thumb-gray-500/50">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
