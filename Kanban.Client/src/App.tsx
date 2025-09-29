import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BoardView } from '@/components/BoardView';
import { Dashboard } from '@/components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedBoardName, setSelectedBoardName] = useState<string | null>(null);

  useEffect(() => {
    // Set dark theme by default
    document.documentElement.classList.add('dark');
  }, []);

  const handleSelectBoard = (boardId: number, boardName: string) => {
    setSelectedBoardId(boardId);
    setSelectedBoardName(boardName);
    setCurrentView('board');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedBoardId(null);
    setSelectedBoardName(null);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="w-full px-6 py-4">
                <div className="flex items-center justify-between w-full">
                  {/* Left side - Title and Back button - positioned at far left */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {currentView === 'board' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToDashboard}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                      </Button>
                    )}
                    <h1 className="text-2xl font-bold whitespace-nowrap">
                      {currentView === 'dashboard' 
                        ? 'LocalFree Kanban' 
                        : selectedBoardName || `Board #${selectedBoardId}`
                      }
                    </h1>
                  </div>
                  
                  {/* Right side - Theme toggle and User menu - positioned at far right */}
                  <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    <ThemeToggle />
                    <UserMenu />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <main>
              {currentView === 'dashboard' ? (
                <Dashboard onSelectBoard={handleSelectBoard} />
              ) : selectedBoardId ? (
                <div className="p-6">
                  <BoardView boardId={selectedBoardId} />
                </div>
              ) : null}
            </main>
          </div>
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
