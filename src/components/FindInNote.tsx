import { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface FindInNoteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindInNote({ isOpen, onClose }: FindInNoteProps) {
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
    if (!searchTerm) {
      clearHighlights();
      setCurrentMatch(0);
      setTotalMatches(0);
      return;
    }

    const matches = highlightMatches(searchTerm);
    setTotalMatches(matches);
    if (matches > 0) {
      setCurrentMatch(1);
      scrollToMatch(0);
    } else {
      setCurrentMatch(0);
    }
  }, [searchTerm]);

  const clearHighlights = () => {
    const editor = document.querySelector('.ProseMirror');
    if (!editor) return;

    // Remove all existing highlights
    const highlights = editor.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ''), highlight);
        parent.normalize();
      }
    });
  };

  const highlightMatches = (term: string): number => {
    clearHighlights();

    const editor = document.querySelector('.ProseMirror');
    if (!editor || !term) return 0;

    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    let matchCount = 0;
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    textNodes.forEach(textNode => {
      const text = textNode.textContent || '';
      const matches = [...text.matchAll(regex)];

      if (matches.length > 0) {
        const parent = textNode.parentNode;
        if (!parent) return;

        let lastIndex = 0;
        const fragment = document.createDocumentFragment();

        matches.forEach((match, index) => {
          const matchStart = match.index!;
          const matchEnd = matchStart + match[0].length;

          // Add text before match
          if (matchStart > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
          }

          // Add highlighted match
          const highlight = document.createElement('span');
          highlight.className = `search-highlight ${index === 0 ? 'search-highlight-current' : ''}`;
          highlight.style.backgroundColor = '#fbbf24';
          highlight.style.color = '#000';
          highlight.style.borderRadius = '2px';
          highlight.style.padding = '1px 2px';
          highlight.textContent = match[0];
          fragment.appendChild(highlight);

          lastIndex = matchEnd;
          matchCount++;
        });

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        parent.replaceChild(fragment, textNode);
      }
    });

    return matchCount;
  };

  const scrollToMatch = (index: number) => {
    const highlights = document.querySelectorAll('.search-highlight');
    if (highlights.length === 0) return;

    // Remove current highlight
    highlights.forEach(h => h.classList.remove('search-highlight-current'));

    // Add current highlight
    const currentHighlight = highlights[index];
    if (currentHighlight) {
      currentHighlight.classList.add('search-highlight-current');
      (currentHighlight as HTMLElement).style.backgroundColor = '#f59e0b';
      currentHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (totalMatches === 0) return;
    const nextIndex = currentMatch >= totalMatches ? 1 : currentMatch + 1;
    setCurrentMatch(nextIndex);
    scrollToMatch(nextIndex - 1);
  };

  const handlePrevious = () => {
    if (totalMatches === 0) return;
    const prevIndex = currentMatch <= 1 ? totalMatches : currentMatch - 1;
    setCurrentMatch(prevIndex);
    scrollToMatch(prevIndex - 1);
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
      clearHighlights();
    };
  }, []);

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