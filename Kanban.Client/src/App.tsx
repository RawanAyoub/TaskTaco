import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { BoardView } from '@/components/BoardView';
import './App.css';

function App() {
  useEffect(() => {
    // Set dark theme by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Kanban Demo - Integrated Components</h1>
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
    </ThemeProvider>
  );
}

export default App;
