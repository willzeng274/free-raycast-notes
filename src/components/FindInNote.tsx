import { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { EditorRef } from './Editor';

interface FindInNoteProps {
  isOpen: boolean;
  onClose: () => void;
  editorRef: React.RefObject<EditorRef>;
}

export function FindInNote({ isOpen, onClose, editorRef }: FindInNoteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (!searchTerm.trim()) {
      editorRef.current.clearSearch();
      setCurrentMatch(0);
      setTotalMatches(0);
      return;
    }

    // Search using the extension
    editorRef.current.searchInEditor(searchTerm.trim());

    // Update counts after a brief delay to let the extension process
    const timeoutId = setTimeout(() => {
      const results = editorRef.current!.getSearchResults();
      setTotalMatches(results.total);
      setCurrentMatch(results.current);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, editorRef]);


  const handleNext = () => {
    if (totalMatches === 0 || !editorRef.current) return;
    editorRef.current.goToNext();

    // Update current match after navigation
    setTimeout(() => {
      const results = editorRef.current!.getSearchResults();
      setCurrentMatch(results.current);
    }, 10);
  };

  const handlePrevious = () => {
    if (totalMatches === 0 || !editorRef.current) return;
    editorRef.current.goToPrevious();

    // Update current match after navigation
    setTimeout(() => {
      const results = editorRef.current!.getSearchResults();
      setCurrentMatch(results.current);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.clearSearch();
      }
    };
  }, [editorRef]);

  if (!isOpen) return null;

  return (
    <div className="bg-[#E8E8E8] dark:bg-[#2A2A2A] px-6 py-2.5">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Find label and input area */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium select-none">Find</span>
          <input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Right side - Counter and controls */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {totalMatches > 0 ? `${currentMatch}/${totalMatches}` : '0/0'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={totalMatches === 0}
              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={totalMatches === 0}
              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 rounded transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}