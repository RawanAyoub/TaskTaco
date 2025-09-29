import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BoardView } from '@/components/BoardView';
import { Dashboard } from '@/components/Dashboard';
import { settingsService } from '@/services/settingsService';
import type { ThemeName } from '@/types/user';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [selectedBoardName, setSelectedBoardName] = useState<string | null>(null);

  // Initialize theme on app load
  useEffect(() => {
    const initializeTheme = async () => {
      let themeToApply: ThemeName = 'Classic Taco';
      
      try {
        // First try to load from API (source of truth)
        const userSettings = await settingsService.getUserSettings();
        themeToApply = userSettings.theme as ThemeName;
        
        // Update cache with API data
        settingsService.setCachedTheme(themeToApply);
      } catch (error) {
        // Fallback to cached theme
        themeToApply = settingsService.getCachedTheme() as ThemeName;
      }

      const savedTheme = themeToApply;      // Remove existing theme classes from both html and body
      document.documentElement.classList.remove('theme-classic-taco', 'theme-guacamole', 'theme-salsa');
      document.body.classList.remove('theme-classic-taco', 'theme-guacamole', 'theme-salsa');
      
      // Add new theme class
      const themeClass = `theme-${savedTheme.toLowerCase().replace(/\s+/g, '-')}`;
      document.documentElement.classList.add(themeClass);
      document.body.classList.add(themeClass);
      
      // Also set CSS variables directly as backup
      let primaryColor = '217 119 6'; // default amber for Classic Taco
      
      if (savedTheme === 'Classic Taco') {
        primaryColor = '217 119 6'; // amber-600
      } else if (savedTheme === 'Guacamole') {
        primaryColor = '101 163 13'; // lime-600
      } else if (savedTheme === 'Salsa') {
        primaryColor = '225 29 72'; // rose-600
      }
      
      document.documentElement.style.setProperty('--primary', primaryColor);
    };

    initializeTheme();

    // Listen for theme changes from settings modal
    const handleThemeChange = (event: CustomEvent) => {
      const { theme } = event.detail;
      // The theme is already applied by the modal, we just need to update our cache
      settingsService.setCachedTheme(theme);
    };
    window.addEventListener('themeChanged', handleThemeChange as EventListener);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
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
            <div className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
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
                    <div className="flex items-center gap-2">
                      <img 
                        src="/src/components/ui/TaskTaco_logo.png" 
                        alt="TaskTaco Logo" 
                        className="w-10 h-10"
                      />
                      <h1 className="text-2xl font-bold whitespace-nowrap text-foreground">
                        {currentView === 'dashboard' 
                          ? 'TaskTaco' 
                          : selectedBoardName || `Board #${selectedBoardId}`
                        }
                      </h1>
                    </div>
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
                <div className="p-6 bg-background">
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
