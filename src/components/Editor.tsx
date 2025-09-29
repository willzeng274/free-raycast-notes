import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import SearchNReplace from '@sereneinserenade/tiptap-search-and-replace';
import { useEffect, useImperativeHandle, forwardRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export interface EditorRef {
  searchInEditor: (term: string) => void;
  clearSearch: () => void;
  getSearchResults: () => { current: number; total: number };
  goToNext: () => void;
  goToPrevious: () => void;
}

export const Editor = forwardRef<EditorRef, EditorProps>(({ content, onChange }, ref) => {
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
      SearchNReplace.configure({
        searchResultClass: 'search-result',
        disableRegex: false,
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

  useImperativeHandle(ref, () => ({
    searchInEditor: (term: string) => {
      if (!editor) return;
      editor.commands.setSearchTerm(term);
    },

    clearSearch: () => {
      if (!editor) return;
      editor.commands.setSearchTerm('');
    },

    getSearchResults: () => {
      if (!editor) return { current: 0, total: 0 };

      const storage = (editor.storage as any).searchAndReplace || {};
      console.log('Search storage:', storage); // Debug logging

      const resultIndex = storage.resultIndex;
      const results = storage.results || [];

      return {
        current: typeof resultIndex === 'number' ? resultIndex + 1 : 0,
        total: results.length || 0
      };
    },

    goToNext: () => {
      if (!editor) return;
      editor.commands.nextSearchResult();
    },

    goToPrevious: () => {
      if (!editor) return;
      editor.commands.previousSearchResult();
    },
  }), [editor]);

  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-8 py-6 scrollbar-thin scrollbar-thumb-gray-300/50 hover:scrollbar-thumb-gray-400/50 scrollbar-track-transparent dark:scrollbar-thumb-gray-600/50 dark:hover:scrollbar-thumb-gray-500/50">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});
