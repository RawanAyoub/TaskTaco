import { BoardView } from '@/components/BoardView';
import { ThemeToggle } from './ui/theme-toggle';
import { Button } from './ui/button';
import { Settings } from 'lucide-react';

interface KanbanBoardProps {
  boardId?: number;
}

export function KanbanBoard({}: KanbanBoardProps) {
  // For now, we'll use the demo component with static data

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Kanban Board</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <BoardView />
    </div>
  );
}