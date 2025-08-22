import { Fragment, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Input } from '@/components/ui/input';
import { Kbd } from "@/components/ui/kbd";
import { 
  Plus, 
  Copy, 
  FileText, 
  Search,
  ExternalLink, 
  Upload,
  ArrowUp,
  ArrowDown,
  Type,
  Trash2,
  Settings,
  ScreenShare,
  ZoomOut,
  ZoomIn,
  RefreshCcw,
  RectangleHorizontal,
  Minus,
  Link2,
  X
} from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  action: () => void;
  shortcut?: React.ReactNode;
  icon: React.ReactNode;
  disabled?: boolean;
}

interface CommandGroup {
  heading: string;
  commands: CommandAction[];
}

interface CommandPaletteProps {
  onNewNote: () => void;
  onDuplicateNote: () => void;
  onBrowseNotes: () => void;
  onFindInNote: () => void;
  onCopyNoteAs: () => void;
  onCopyDeeplink: () => void;
  onCreateQuicklink: () => void;
  onExport: () => void;
  onMoveListItemUp: () => void;
  onMoveListItemDown: () => void;
  onFormat: () => void;
  onDeleteNote: () => void;
  currentNote?: any;
  onClose: () => void;
  screenSharingVisible: boolean;
  onToggleScreenSharing: () => Promise<boolean>;
}

export function CommandPaletteContent({
  onNewNote,
  onDuplicateNote,
  onBrowseNotes,
  onFindInNote,
  onCopyNoteAs,
  onCopyDeeplink,
  onCreateQuicklink,
  onExport,
  onMoveListItemUp,
  onMoveListItemDown,
  onFormat,
  onDeleteNote,
  currentNote,
  onClose,
  screenSharingVisible,
  onToggleScreenSharing
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const toggleScreenSharingVisibility = async () => {
    try {
      await onToggleScreenSharing();
    } catch (error) {
      console.error('Failed to toggle screen sharing visibility:', error);
    }
  };

  const commandGroups: CommandGroup[] = [
    {
      heading: 'General',
      commands: [
        {
          id: 'new-note',
          label: 'New Note',
          action: () => { onNewNote(); onClose(); },
          shortcut: <><Kbd>⌘</Kbd><Kbd>N</Kbd></>,
          icon: <Plus className="w-4 h-4" />
        },
        {
          id: 'duplicate-note',
          label: 'Duplicate Note',
          action: () => { onDuplicateNote(); onClose(); },
          shortcut: <><Kbd>⌘</Kbd><Kbd>D</Kbd></>,
          icon: <Copy className="w-4 h-4" />,
          disabled: !currentNote
        },
        {
          id: 'browse-notes',
          label: 'Browse Notes',
          action: () => { onBrowseNotes(); onClose(); },
          shortcut: <><Kbd>⌘</Kbd><Kbd>P</Kbd></>,
          icon: <FileText className="w-4 h-4" />
        },
      ]
    },
    {
      heading: 'Navigation',
      commands: [
        {
          id: 'find-in-note',
          label: 'Find in Note',
          action: () => { onFindInNote(); onClose(); },
          shortcut: <><Kbd>⌘</Kbd><Kbd>F</Kbd></>,
          icon: <Search className="w-4 h-4" />
        },
      ]
    },
    {
      heading: 'Actions',
      commands: [
        {
          id: 'copy-note-as',
          label: 'Copy Note As...',
          action: () => { onCopyNoteAs(); onClose(); },
          shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>C</Kbd></>,
          icon: <Copy className="w-4 h-4" />,
          disabled: !currentNote
        },
        {
          id: 'copy-deeplink',
          label: 'Copy Deeplink',
          action: () => { onCopyDeeplink(); onClose(); },
          shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>D</Kbd></>,
          icon: <Link2 className="w-4 h-4" />,
          disabled: !currentNote
        },
        {
          id: 'create-quicklink',
          label: 'Create Quicklink',
          action: () => { onCreateQuicklink(); onClose(); },
          shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>L</Kbd></>,
          icon: <ExternalLink className="w-4 h-4" />,
          disabled: !currentNote
        },
        {
          id: 'export',
          label: 'Export...',
          action: () => { onExport(); onClose(); },
          shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>E</Kbd></>,
          icon: <Upload className="w-4 h-4" />,
          disabled: !currentNote
        },
      ]
    },
    {
      heading: 'Editing',
      commands: [
        {
          id: 'move-list-item-up',
          label: 'Move List Item Up',
          action: () => { onMoveListItemUp(); onClose(); },
          shortcut: <><Kbd>⌃</Kbd><Kbd>⌘</Kbd><Kbd>↑</Kbd></>,
          icon: <ArrowUp className="w-4 h-4" />,
          disabled: true
        },
        {
          id: 'move-list-item-down',
          label: 'Move List Item Down',
          action: () => { onMoveListItemDown(); onClose(); },
          shortcut: <><Kbd>⌃</Kbd><Kbd>⌘</Kbd><Kbd>↓</Kbd></>,
          icon: <ArrowDown className="w-4 h-4" />,
          disabled: true
        },
        {
          id: 'format',
          label: 'Format...',
          action: () => { onFormat(); onClose(); },
          shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>,</Kbd></>,
          icon: <Type className="w-4 h-4" />,
          disabled: !currentNote
        },
      ]
    },
    {
      heading: 'Window',
      commands: [
        { id: 'disable-window-auto-sizing', label: 'Disable Window Auto-sizing', action: () => {}, shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>/</Kbd></>, icon: <RectangleHorizontal className="w-4 h-4" />, disabled: true },
        { id: 'show-format-bar', label: 'Show Format Bar', action: () => {}, shortcut: <><Kbd>⌥</Kbd><Kbd>⌘</Kbd><Kbd>,</Kbd></>, icon: <Minus className="w-4 h-4" />, disabled: true },
        { id: 'reset-zoom', label: 'Reset Zoom', action: () => {}, shortcut: <><Kbd>⌘</Kbd><Kbd>0</Kbd></>, icon: <RefreshCcw className="w-4 h-4" />, disabled: true },
        { id: 'zoom-in', label: 'Zoom In', action: () => {}, shortcut: <><Kbd>⌘</Kbd><Kbd>=</Kbd></>, icon: <ZoomIn className="w-4 h-4" />, disabled: true },
        { id: 'zoom-out', label: 'Zoom Out', action: () => {}, shortcut: <><Kbd>⌘</Kbd><Kbd>-</Kbd></>, icon: <ZoomOut className="w-4 h-4" />, disabled: true },
        { 
          id: 'toggle-screen-sharing', 
          label: screenSharingVisible ? 'Hide While Screen Sharing' : 'Show While Screen Sharing', 
          action: () => { toggleScreenSharingVisibility(); onClose(); }, 
          shortcut: <><Kbd>⇧</Kbd><Kbd>⌘</Kbd><Kbd>H</Kbd></>, 
          icon: <ScreenShare className={`w-4 h-4 ${screenSharingVisible ? 'text-green-500' : 'text-gray-400'}`} />, 
          disabled: false 
        },
        {
          id: 'quit-app',
          label: 'Quit Raycast Notes',
          action: () => { invoke('quit_app'); onClose(); },
          shortcut: <><Kbd>⌘</Kbd><Kbd>Q</Kbd></>,
          icon: <X className="w-4 h-4 text-red-500" />,
          disabled: false
        },
      ]
    },
    {
      heading: 'Settings',
      commands: [
        { id: 'open-raycast-notes-settings', label: 'Open Raycast Notes Settings', action: () => {}, shortcut: <><Kbd>⌘</Kbd><Kbd>,</Kbd></>, icon: <Settings className="w-4 h-4" />, disabled: true },
        { id: 'recently-deleted-notes', label: 'Recently Deleted Notes', action: () => {}, icon: <Trash2 className="w-4 h-4" />, disabled: true },
        {
          id: 'delete-note',
          label: 'Delete Note',
          action: () => { onDeleteNote(); onClose(); },
          shortcut: <><Kbd>⌃</Kbd><Kbd>X</Kbd></>,
          icon: <Trash2 className="w-4 h-4 text-red-500" />,
          disabled: !currentNote
        },
      ]
    }
  ];

  const allCommands = commandGroups.flatMap(g => g.commands);
  const filteredCommands = allCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );
  const activeCommands = search ? filteredCommands : allCommands;

  const commandList = search ? [{ heading: 'Search Results', commands: filteredCommands }] : commandGroups;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < activeCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : activeCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = activeCommands[selectedIndex];
        if (command && !command.disabled) {
          command.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCommands, selectedIndex, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);
  
  return (
    <>
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for actions..."
          className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent placeholder-gray-400 dark:placeholder-gray-500 h-7 px-0 font-normal shadow-none outline-none"
          autoFocus
        />
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 hover:scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
        {commandList.map((group, groupIndex) => (
          <Fragment key={group.heading}>
            {group.commands.length > 0 && groupIndex > 0 && <div className="h-px bg-gray-200/80 dark:bg-gray-700/80 mx-2 my-1" />}
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{group.heading}</p>
            </div>
            {group.commands.map((command) => {
              const commandIndex = activeCommands.findIndex(c => c.id === command.id);
              return (
                <div
                  key={command.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-[13px] transition-colors ${
                    commandIndex === selectedIndex 
                      ? 'bg-gray-200/70 dark:bg-gray-700/50' 
                      : command.disabled 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/30'
                  }`}
                  onClick={() => {
                    if (!command.disabled) {
                      command.action();
                    }
                  }}
                >
                  <span className={`${command.id === 'delete-note' ? 'text-red-500' : command.disabled ? 'text-gray-400/80 dark:text-gray-600/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {command.icon}
                  </span>
                  <span className={`flex-1 font-medium ${command.id === 'delete-note' ? 'text-red-500' : (commandIndex === selectedIndex ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300')}`}>{command.label}</span>
                  {command.shortcut && (
                    <div className="flex items-center gap-1 opacity-70">
                      {command.shortcut}
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </>
  );
}
