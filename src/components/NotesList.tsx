import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2 } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNote: () => void;
}

export function NotesList({ notes, onSelectNote, onDeleteNote, onCreateNote }: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedNotes = searchQuery ? filteredNotes : notes;

  if (displayedNotes.length === 0 && !searchQuery) {
    return <EmptyState onCreateNote={onCreateNote} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-10 bg-gray-50 border-gray-200 text-sm h-8 focus-visible:ring-0 focus-visible:border-blue-300"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {displayedNotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
            <div className="text-center">
              <p className="text-sm text-gray-400">No notes found</p>
            </div>
          </div>
        ) : (
          displayedNotes.map((note, index) => (
            <div
              key={note.id}
              className={`group px-3 py-2.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                index === 0 ? 'border-t-0' : ''
              }`}
              onClick={() => onSelectNote(note)}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-1.5 leading-relaxed">
                    {note.content || 'No content'}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Word count at bottom */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {displayedNotes.length} {displayedNotes.length === 1 ? 'note' : 'notes'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">⌘N</span>
            <span className="text-xs text-gray-500">New</span>
          </div>
        </div>
      </div>
    </div>
  );
}
