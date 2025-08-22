import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

interface EmptyStateProps {
  onCreateNote: () => void;
}

export function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
      <div className="text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2 text-gray-600">No notes yet</p>
        <p className="text-sm text-gray-400 mb-4">Press ⌘N to create your first note</p>
        <Button 
          onClick={onCreateNote} 
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white border-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>
    </div>
  );
}
