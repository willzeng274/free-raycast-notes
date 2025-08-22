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
        class: 'prose prose-p:my-1 prose-li:my-0 focus:outline-none max-w-none text-gray-800 dark:text-gray-200 dark:prose-invert',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-thin scrollbar-thumb-gray-300/50 hover:scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
      <EditorContent editor={editor} />
    </div>
  );
}
