import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Command, List, Plus, X, ScreenShare } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Kbd } from './ui/kbd';
import { useWindowFocus } from '../hooks/useWindowFocus';

interface TitleBarProps {
    title: string;
    onCommandPalette: () => void;
    onBrowseNotes: () => void;
    onNewNote: () => void;
    screenSharingVisible: boolean;
}

export function TitleBar({ title, onCommandPalette, onBrowseNotes, onNewNote, screenSharingVisible }: TitleBarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isWindowFocused = useWindowFocus();

    return (
        <div
            data-tauri-drag-region
            className="drag-region h-10 bg-transparent flex items-center justify-between px-4 select-none border-b border-gray-200/40 dark:border-gray-700/40"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div data-tauri-drag-region className="drag-region flex items-center gap-1.5">
                <div 
                    className={`w-3 h-3 rounded-full flex items-center justify-center cursor-pointer transition-all ${isWindowFocused ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300/70 dark:bg-gray-600/70'} ${!isHovered ? 'opacity-50' : 'opacity-100'}`}
                    onClick={() => invoke('hide_panel')}
                >
                    {isHovered && <X className="w-2 h-2 text-white" strokeWidth={3} />}
                </div>
                <div 
                    className={`w-3 h-3 rounded-full bg-gray-300/70 dark:bg-gray-600/70 transition-opacity ${!isHovered ? 'opacity-50' : 'opacity-100'}`}
                ></div>
                <div 
                    className={`w-3 h-3 rounded-full bg-gray-300/70 dark:bg-gray-600/70 transition-opacity ${!isHovered ? 'opacity-50' : 'opacity-100'}`}
                ></div>
            </div>
            <div data-tauri-drag-region className="drag-region flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                    <span data-tauri-drag-region className="drag-region text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide">{title}</span>
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center">
                                    <ScreenShare 
                                        className={`w-3 h-3 ${screenSharingVisible ? 'text-green-500' : 'text-red-500'}`}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{screenSharingVisible ? 'Visible while screen sharing' : 'Hidden while screen sharing'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div data-tauri-drag-region className="drag-region flex items-center gap-0.5">
                {/* Header icons - hidden by default, shown on hover */}
                <div className={`flex items-center gap-0.5 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    data-tauri-drag-region
                                    variant="ghost" 
                                    size="sm" 
                                    className="drag-region w-6 h-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" 
                                    onClick={onCommandPalette}
                                >
                                    <Command data-tauri-drag-region className="drag-region w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex items-center gap-2">
                                    <p>Command Palette</p>
                                    <div className="flex items-center gap-1">
                                        <Kbd>⌘</Kbd><Kbd>K</Kbd>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    data-tauri-drag-region
                                    variant="ghost" 
                                    size="sm" 
                                    className="drag-region w-6 h-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" 
                                    onClick={onBrowseNotes}
                                >
                                    <List data-tauri-drag-region className="drag-region w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex items-center gap-2">
                                    <p>Browse Notes</p>
                                    <div className="flex items-center gap-1">
                                        <Kbd>⌘</Kbd><Kbd>P</Kbd>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    data-tauri-drag-region
                                    variant="ghost" 
                                    size="sm" 
                                    className="drag-region w-6 h-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors" 
                                    onClick={onNewNote}
                                >
                                    <Plus data-tauri-drag-region className="drag-region w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex items-center gap-2">
                                    <p>New Note</p>
                                    <div className="flex items-center gap-1">
                                        <Kbd>⌘</Kbd><Kbd>N</Kbd>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
