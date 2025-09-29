
import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TitleBar } from './components/TitleBar';
import { CommandPaletteContent } from './components/CommandPaletteContent';
import { SearchOverlayContent } from './components/SearchPanelContent';
import { Type } from 'lucide-react';
import { Editor, EditorRef } from './components/Editor';
import { Panel } from './components/Panel';
import { FindInNote } from './components/FindInNote';
import { useScreenSharingVisibility } from './hooks/useScreenSharingVisibility';
import "./index.css";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [activePanel, setActivePanel] = useState<'commands' | 'search' | null>(null);
  const [showFindInNote, setShowFindInNote] = useState(false);
  const { isVisible: screenSharingVisible, toggleVisibility: toggleScreenSharing } = useScreenSharingVisibility();
  const editorRef = useRef<EditorRef>(null);

  const getTitleFromContent = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const firstH1 = doc.querySelector('h1');
    return firstH1 ? firstH1.innerText : 'Untitled';
  };

  // Initialize with first note or create one
  useEffect(() => {
    const createInitialNote = () => {
      const now = Date.now();
      const newNote: Note = {
        id: now.toString(),
        title: 'Untitled',
        content: '<h1>Untitled</h1>',
        createdAt: now,
        updatedAt: now,
        pinned: false
      };
      setNotes([newNote]);
      setCurrentNote(newNote);
      setContent(newNote.content);
    };

    const savedNotes = localStorage.getItem('raycast-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes);
      // Sort notes on initial load
      parsedNotes.sort((a: Note, b: Note) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
      setNotes(parsedNotes);
      if (parsedNotes.length > 0) {
        setCurrentNote(parsedNotes[0]);
        setContent(parsedNotes[0].content);
      } else {
        createInitialNote();
      }
    } else {
      createInitialNote();
    }
  }, []);

  // Auto-save functionality
  const saveCurrentNote = useCallback(() => {
    if (!currentNote) return;

    const updatedNote = {
      ...currentNote,
      title: getTitleFromContent(content),
      content,
      updatedAt: Date.now()
    };

    setNotes(prev => prev.map(note =>
      note.id === currentNote.id ? updatedNote : note
    ));
    setCurrentNote(updatedNote);
  }, [currentNote, content]);

  useEffect(() => {
    if (!currentNote) return;

    if (content !== currentNote.content) {
      saveCurrentNote();
    }
  }, [content, currentNote, saveCurrentNote]);

  // Save to localStorage whenever notes change
  useEffect(() => {
    // Sort notes before saving to ensure pinned notes are maintained at the top
    const sortedNotes = [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
    localStorage.setItem('raycast-notes', JSON.stringify(sortedNotes));
  }, [notes]);

  const handleCreateNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: now.toString(),
      title: 'Untitled',
      content: '<h1>Untitled</h1>',
      createdAt: now,
      updatedAt: now,
      pinned: false
    };
    
    // Insert new note after the last pinned note
    const lastPinnedIndex = notes.findLastIndex(note => note.pinned);
    const newNotes = [...notes];
    newNotes.splice(lastPinnedIndex + 1, 0, newNote);

    setNotes(newNotes);
    setCurrentNote(newNote);
    setContent(newNote.content);
  }, [notes]);

  const handleDuplicateNote = useCallback(() => {
    if (!currentNote) return;
    const now = Date.now();
    const duplicatedNote: Note = {
      id: now.toString(),
      title: `${getTitleFromContent(currentNote.content)} Copy`,
      content: currentNote.content,
      createdAt: now,
      updatedAt: now,
      pinned: currentNote.pinned
    };

    // Insert duplicated note after the last pinned note
    const lastPinnedIndex = notes.findLastIndex(note => note.pinned);
    const newNotes = [...notes];
    newNotes.splice(lastPinnedIndex + 1, 0, duplicatedNote);

    setNotes(newNotes);
    setCurrentNote(duplicatedNote);
    setContent(duplicatedNote.content);
  }, [currentNote, notes]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Note: Could prevent shortcuts when typing if needed
      // const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      // Command Palette (⌘+K)
      if (cmdKey && e.key === 'k') {
        e.preventDefault();
        setActivePanel(p => p === 'commands' ? null : 'commands');
      }

      // Search/Browse Notes (⌘+P)
      if (cmdKey && e.key === 'p') {
        e.preventDefault();
        setActivePanel(p => p === 'search' ? null : 'search');
      }

      // New Note (⌘+N)
      if (cmdKey && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }

      // Duplicate Note (⌘+D)
      if (cmdKey && e.key === 'd') {
        e.preventDefault();
        handleDuplicateNote();
      }

      // Hide Panel (⌘+W)
      if (cmdKey && e.key === 'w') {
        e.preventDefault();
        invoke('hide_panel');
      }

      // Find in Note (⌘+F)
      if (cmdKey && e.key === 'f') {
        e.preventDefault();
        setShowFindInNote(true);
      }

      // Quit App (⌘+Q)
      if (cmdKey && e.key === 'q') {
        e.preventDefault();
        invoke('quit_app');
      }

      // Hide Panel (Escape)
      if (e.key === 'Escape') {
        e.preventDefault();
        invoke('hide_panel');
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleCreateNote, handleDuplicateNote]);

  const handleSelectNote = (note: Note) => {
    // Save current note before switching
    if (currentNote && (content !== currentNote.content)) {
      saveCurrentNote();
    }
    
    setCurrentNote(note);
    setContent(note.content);
    setActivePanel(null);
  };

  const handleDeleteNote = (noteId: string) => {
    const remainingNotes = notes.filter(note => note.id !== noteId);
    
    setNotes(remainingNotes);
    
    if (currentNote?.id === noteId) {
      if (remainingNotes.length > 0) {
        // Switch to the next note
        const nextNote = remainingNotes[0];
        setCurrentNote(nextNote);
        setContent(nextNote.content);
      } else {
        // Create a new note if no notes remain
        handleCreateNote();
      }
    }
  };

  const handleDeleteCurrentNote = () => {
    if (currentNote) {
      handleDeleteNote(currentNote.id);
    }
  }

  const handlePinNote = (noteId: string) => {
    const newNotes = notes.map(note => {
      if (note.id === noteId) {
        return { ...note, pinned: !note.pinned };
      }
      return note;
    });

    // Sort notes to show pinned ones first, then by last updated
    newNotes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
    
    setNotes(newNotes);
  };

  // Command palette actions
  const handleCopyNoteAsMarkdown = () => {
    if (!currentNote) return;
    const markdown = currentNote.content;
    navigator.clipboard.writeText(markdown);
  };

  const handleCopyDeeplink = () => {
    if (!currentNote) return;
    const deeplink = `raycast://notes/${currentNote.id}`;
    navigator.clipboard.writeText(deeplink);
  };

  const handleCreateQuicklink = () => {
    console.log('Create Quicklink');
  };

  const handleExport = () => {
    if (!currentNote) return;
    const markdown = currentNote.content;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title || 'Untitled'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMoveListItemUp = () => {
    console.log('Move List Item Up');
  };

  const handleMoveListItemDown = () => {
    console.log('Move List Item Down');
  };

  const handleFormat = () => {
    // Format functionality not implemented
  };

  const handleFindInNote = () => {
    setShowFindInNote(true);
  };

  const [showCharCount, setShowCharCount] = useState(false);
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.replace(/<[^>]*>/g, '').length;

  return (
    <main className="h-screen w-screen flex flex-col bg-[#F5F5F5] dark:bg-[#1C1C1C] rounded-xl overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/25 fixed inset-0">
      <TitleBar
        title={currentNote ? currentNote.title : 'Raycast Notes'}
        onCommandPalette={() => setActivePanel(activePanel === 'commands' ? null : 'commands')}
        onBrowseNotes={() => setActivePanel(activePanel === 'search' ? null : 'search')}
        onNewNote={handleCreateNote}
        screenSharingVisible={screenSharingVisible}
      />

      <FindInNote isOpen={showFindInNote} onClose={() => setShowFindInNote(false)} editorRef={editorRef} />

      <div className="flex-1 relative overflow-hidden">
        <Editor ref={editorRef} content={content} onChange={setContent} />

        {activePanel && (
          <div 
            className="absolute inset-0"
            onClick={() => setActivePanel(null)}
          >
            <Panel onClose={() => setActivePanel(null)}>
              {activePanel === 'search' && (
                <SearchOverlayContent
                  notes={notes}
                  currentNote={currentNote}
                  onSelectNote={handleSelectNote}
                  onDeleteNote={handleDeleteNote}
                  onPinNote={handlePinNote}
                  onClose={() => setActivePanel(null)}
                />
              )}
              {activePanel === 'commands' && (
                <CommandPaletteContent
                  onNewNote={handleCreateNote}
                  onDuplicateNote={handleDuplicateNote}
                  onBrowseNotes={() => setActivePanel('search')}
                  onFindInNote={handleFindInNote}
                  onCopyNoteAs={handleCopyNoteAsMarkdown}
                  onCopyDeeplink={handleCopyDeeplink}
                  onCreateQuicklink={handleCreateQuicklink}
                  onExport={handleExport}
                  onMoveListItemUp={handleMoveListItemUp}
                  onMoveListItemDown={handleMoveListItemDown}
                  onFormat={handleFormat}
                  onDeleteNote={handleDeleteCurrentNote}
                  currentNote={currentNote}
                  onClose={() => setActivePanel(null)}
                  screenSharingVisible={screenSharingVisible}
                  onToggleScreenSharing={toggleScreenSharing}
                />
              )}
            </Panel>
          </div>
        )}
      </div>

      {/* Footer with word count */}
      <div className="px-4 py-1.5 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex justify-center items-center gap-2">
          <Type className="w-3 h-3 text-gray-400 dark:text-gray-500" />
          <span 
            className="text-[11px] text-gray-500 dark:text-gray-400 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            onClick={() => setShowCharCount(!showCharCount)}
          >
            {showCharCount 
              ? `${charCount} character${charCount !== 1 ? 's' : ''}` 
              : `${wordCount} word${wordCount !== 1 ? 's' : ''}`
            }
          </span>
        </div>
      </div>
    </main>
  );
}

export default App;
