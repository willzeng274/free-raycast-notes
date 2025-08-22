import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Search, X, ArrowLeft, MoreHorizontal } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (note: Note) => void;
  onBackToList: () => void;
  onOpenCommandPalette: () => void;
}

export function NoteEditor({ note, onUpdateNote, onBackToList, onOpenCommandPalette }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-save functionality
  const saveNote = useCallback(() => {
    if (title !== note.title || content !== note.content) {
      const updatedNote = {
        ...note,
        title,
        content,
        updatedAt: Date.now()
      };
      onUpdateNote(updatedNote);
    }
  }, [note, title, content, onUpdateNote]);

  useEffect(() => {
    const timer = setTimeout(saveNote, 1000);
    return () => clearTimeout(timer);
  }, [title, content, saveNote]);

  // Update local state when note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  // Calculate word count
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Editor Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="text-gray-600 hover:text-gray-900 p-1 h-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">Back to notes</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommandPalette}
            className="text-gray-600 hover:text-gray-900 p-1 h-auto"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar (when active) */}
      {isSearching && (
        <div className="px-4 py-2 border-b border-gray-200 bg-yellow-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in note..."
              className="pl-10 text-sm h-8 border-yellow-200 focus-visible:ring-0 focus-visible:border-yellow-300"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
              onClick={() => setIsSearching(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="px-4 py-3 border-b border-gray-100">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent placeholder-gray-400"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full resize-none border-0 focus-visible:ring-0 text-base leading-relaxed placeholder-gray-400 p-0 bg-transparent"
        />
      </div>

      {/* Footer with word count */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>⌘F Find</span>
            <span>⌘K Actions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
