import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Folder, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Boards } from '@/services/boards';
import { CreateBoardDialog } from '@/components/dialogs/CreateBoardDialog';
import type { BoardDto } from '@/types/api';

interface DashboardProps {
  onSelectBoard: (boardId: number) => void;
}

export function Dashboard({ onSelectBoard }: DashboardProps) {
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const boardList = await Boards.list();
      setBoards(boardList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const handleBoardCreated = (newBoard: { id: number; name: string }) => {
    setBoards(prev => [...prev, newBoard]);
    setError(null);
  };

  const handleDeleteBoard = async (boardId: number, boardName: string) => {
    if (!confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await Boards.delete(boardId);
      setBoards(prev => prev.filter(board => board.id !== boardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Kanban Boards</h1>
          <p className="text-muted-foreground mt-1">
            Organize your projects and tasks efficiently
          </p>
        </div>
        
        <CreateBoardDialog onBoardCreated={handleBoardCreated} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No boards yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first Kanban board to get started organizing your tasks
          </p>
          <CreateBoardDialog 
            onBoardCreated={handleBoardCreated}
            trigger={
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Board
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Card 
              key={board.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{board.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Board #{board.id}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBoard(board.id, board.name);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-between group-hover:bg-accent"
                  onClick={() => onSelectBoard(board.id)}
                >
                  Open Board
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {boards.length > 0 && (
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total boards: {boards.length}</span>
            <span>LocalFree Kanban • Privacy-First Project Management</span>
          </div>
        </div>
      )}
    </div>
  );
}