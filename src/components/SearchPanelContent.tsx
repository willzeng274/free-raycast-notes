import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { FileText, Trash2, Pin, Info } from 'lucide-react';
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const getTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

const getCharacterCount = (content: string) => {
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length;
};

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

interface SearchOverlayContentProps {
  notes: Note[];
  currentNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onPinNote: (noteId: string) => void;
  onClose: () => void;
}

export function SearchOverlayContent({ 
  notes, 
  currentNote,
  onSelectNote,
  onDeleteNote,
  onPinNote,
  onClose
}: SearchOverlayContentProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredNotes = notes.filter(note => {
    const searchLower = search.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(searchLower);
    const contentMatch = note.content.toLowerCase().includes(searchLower);
    return titleMatch || contentMatch;
  });

  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.pinned);

  const isCurrentNote = (note: Note) => {
    return currentNote?.id === note.id;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredNotes.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedNote = filteredNotes[selectedIndex];
        if (selectedNote) {
          onSelectNote(selectedNote);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredNotes, selectedIndex, onSelectNote, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <>
      {/* Search Input */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for notes..."
          className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent placeholder-gray-400 dark:placeholder-gray-500 h-7 px-0 font-normal shadow-none outline-none"
          autoFocus
        />
      </div>

      {/* Notes List */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No notes found</p>
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Pinned</span>
                </div>
                {pinnedNotes.map((note, index) => (
                  <NoteItem 
                    key={note.id}
                    note={note}
                    isSelected={selectedIndex === index}
                    onSelect={() => onSelectNote(note)}
                    onPinNote={onPinNote}
                    onDeleteNote={onDeleteNote}
                    isCurrent={isCurrentNote(note)}
                  />
                ))}
              </div>
            )}
            {unpinnedNotes.length > 0 && (
              <div>
                <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Notes</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {filteredNotes.length}/{notes.length} Notes
                    </span>
                    <Info className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                {unpinnedNotes.map((note, index) => (
                  <NoteItem 
                    key={note.id}
                    note={note}
                    isSelected={selectedIndex === pinnedNotes.length + index}
                    onSelect={() => onSelectNote(note)}
                    onPinNote={onPinNote}
                    onDeleteNote={onDeleteNote}
                    isCurrent={isCurrentNote(note)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

interface ActionProps {
  note: Note;
  onPinNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

function NoteActions({ note, onPinNote, onDeleteNote }: ActionProps) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onPinNote(note.id);
              }}
            >
              <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'text-orange-500 fill-orange-500' : ''}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <p>{note.pinned ? 'Unpin' : 'Pin'} Note</p>
              <div className="flex items-center gap-0.5">
                <Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>P</Kbd>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-2">
              <p>Delete Note</p>
              <div className="flex items-center gap-0.5">
                <Kbd>⌃</Kbd><Kbd>X</Kbd>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  onPinNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

function NoteItem({ note, isSelected, isCurrent, onSelect, onPinNote, onDeleteNote }: NoteItemProps) {
  return (
    <div
      className={`group relative cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-gray-200/70 dark:bg-gray-700/50' 
          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/30'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isCurrent && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            )}
            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-[13px] truncate">
              {note.title || 'Untitled'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            {isCurrent && (
              <>
                <span className="text-red-500">Current</span>
                <span className="text-gray-400 dark:text-gray-500">•</span>
              </>
            )}
            <span>Opened {getTimeAgo(note.updatedAt)}</span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span>{getCharacterCount(note.content).toLocaleString()} Characters</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <NoteActions note={note} onPinNote={onPinNote} onDeleteNote={onDeleteNote} />
        </div>
      </div>
    </div>
  )
}