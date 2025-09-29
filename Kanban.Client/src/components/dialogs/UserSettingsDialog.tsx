import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { Input } from '@/components/ui/input';
import { Loader2, Settings } from 'lucide-react';
import { UserService } from '@/services/user';
import type { UserSettingsDto } from '@/types/api';

interface UserSettingsDialogProps {
  trigger?: React.ReactNode;
}

const EMOJI_OPTIONS = ['🌮', '🥑', '🌶️', '🚀', '⭐', '🎯', '🔥', '💡', '✨', '🏆'];
const DEFAULT_EMOJI = '🌮';

export function UserSettingsDialog({ trigger }: UserSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettingsDto | null>(null);
  const [formData, setFormData] = useState({
    theme: 'Classic Taco',
    defaultEmoji: '🌮',
  });

  // Load settings when dialog opens
  useEffect(() => {
    if (open && !settings) {
      loadSettings();
    }
  }, [open, settings]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const userSettings = await UserService.getSettings();
      setSettings(userSettings);
      setFormData({
        theme: userSettings.theme,
        defaultEmoji: userSettings.defaultEmoji,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.theme.trim()) {
      setError('Theme is required');
      return;
    }

    if (!formData.defaultEmoji.trim()) {
      setError('Default emoji is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await UserService.updateSettings({
        theme: formData.theme.trim(),
        defaultEmoji: formData.defaultEmoji.trim(),
      });
      
      // Update local settings state
      if (settings) {
        setSettings({
          ...settings,
          theme: formData.theme,
          defaultEmoji: formData.defaultEmoji,
        });
      }
      
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
    
    // Apply theme instantly when theme is changed
    if (field === 'theme') {

      applyTheme(value);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({ ...prev, defaultEmoji: emoji }));
    if (error) setError(null);
  };

  const handleResetEmoji = () => {
    setFormData(prev => ({ ...prev, defaultEmoji: DEFAULT_EMOJI }));
    if (error) setError(null);
  };

  const applyTheme = (theme: string) => {
    // Remove existing theme classes from both html and body
    document.documentElement.classList.remove('theme-classic-taco', 'theme-guacamole', 'theme-salsa');
    document.body.classList.remove('theme-classic-taco', 'theme-guacamole', 'theme-salsa');
    
    // Add new theme class
    const themeClass = `theme-${theme.toLowerCase().replace(/\s+/g, '-')}`;
    document.documentElement.classList.add(themeClass);
    document.body.classList.add(themeClass);
    
    // Debug logging

    
    // Force a style recalculation and repaint
    document.documentElement.offsetHeight;
    document.body.offsetHeight;
    
    // Set CSS variables directly as backup
    let primaryColor = '217 119 6'; // default amber for Classic Taco
    
    if (theme === 'Classic Taco') {
      primaryColor = '217 119 6'; // amber-600
    } else if (theme === 'Guacamole') {
      primaryColor = '101 163 13'; // lime-600
    } else if (theme === 'Salsa') {
      primaryColor = '225 29 72'; // rose-600
    }
    
    document.documentElement.style.setProperty('--primary', primaryColor);
    console.log('Theme:', theme, 'Primary color set to:', primaryColor);
    
    // Dispatch custom event to notify App component
    console.log('Dispatching themeChanged event for:', theme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" title="Settings">
      <Settings className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Customize your TaskTaco experience
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {settings?.availableThemes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultEmoji">Default Task Emoji</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetEmoji}
                  disabled={formData.defaultEmoji === DEFAULT_EMOJI}
                  className="text-xs"
                >
                  Reset to 🌮
                </Button>
              </div>
              
              {/* Visual Emoji Selector */}
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`p-3 text-xl border rounded-md hover:bg-accent transition-colors ${
                      formData.defaultEmoji === emoji 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleEmojiSelect(emoji)}
                    title={`Select ${emoji} as default emoji`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* Show selected emoji and allow custom input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  <span className="text-2xl">{formData.defaultEmoji}</span>
                </div>
                <Input
                  id="defaultEmoji"
                  type="text"
                  value={formData.defaultEmoji}
                  onChange={(e) => handleInputChange('defaultEmoji', e.target.value)}
                  placeholder="🌮"
                  maxLength={10}
                  className="text-center text-lg"
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Click a sticker above or type a custom emoji. This will be used as the default for new tasks.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}