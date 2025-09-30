import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { AVAILABLE_THEMES, THEME_CONFIG, type ThemeName } from '../types/user';
import { settingsService } from '../services/settingsService';
import type { UserSettingsResponse, UpdateUserSettingsRequest } from '../types/user';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdate?: (settings: UserSettingsResponse) => void;
}

const EMOJI_OPTIONS = ['🌮', '🥑', '🌶️', '🚀', '⭐', '🎯', '🔥', '💡', '✨', '🏆'];

export function SettingsModal({ isOpen, onClose, onSettingsUpdate }: SettingsModalProps) {
  const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(AVAILABLE_THEMES.CLASSIC_TACO);
  const [selectedEmoji, setSelectedEmoji] = useState('🌮');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalThemeRef = useRef<ThemeName | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<{ theme: ThemeName; emoji: string } | null>(null);

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Apply theme instantly when selection changes (for preview)
  useEffect(() => {
    if (isOpen) {
      applyTheme(selectedTheme);
      // Temporarily update cache for immediate effect (will be reverted if cancelled)
      settingsService.setCachedTheme(selectedTheme);
    }
  }, [selectedTheme, isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API, fallback to cached values
      try {
        const userSettings = await settingsService.getUserSettings();
        setSettings(userSettings);
        const currentTheme = userSettings.theme as ThemeName;
        setSelectedTheme(currentTheme);
        setSelectedEmoji(userSettings.defaultEmoji);
        // Store original theme for potential cancellation
        originalThemeRef.current = currentTheme;
        setInitialSnapshot({ theme: currentTheme, emoji: userSettings.defaultEmoji });
      } catch (apiError) {
        // Fallback to cached settings
        const cachedTheme = settingsService.getCachedTheme() as ThemeName;
        const cachedEmoji = settingsService.getCachedDefaultEmoji();
        setSelectedTheme(cachedTheme);
        setSelectedEmoji(cachedEmoji);
        // Store original theme for potential cancellation
        originalThemeRef.current = cachedTheme;
        setInitialSnapshot({ theme: cachedTheme, emoji: cachedEmoji });
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);



      const updateData: UpdateUserSettingsRequest = {
        theme: selectedTheme,
        defaultEmoji: selectedEmoji,
      };

      // Update via API
      const updatedSettings = await settingsService.updateUserSettings(updateData);
      
      // Update cached values for immediate UI response
      settingsService.setCachedTheme(selectedTheme);
      settingsService.setCachedDefaultEmoji(selectedEmoji);

      
      // Apply theme immediately
      applyTheme(selectedTheme);
      
      setSettings(updatedSettings);
      onSettingsUpdate?.(updatedSettings);
      onClose();
    } catch (err) {
      setError('Failed to save settings. Changes will be cached locally.');
      
      // Still update cache for immediate UI response
      settingsService.setCachedTheme(selectedTheme);
      settingsService.setCachedDefaultEmoji(selectedEmoji);
      applyTheme(selectedTheme);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: ThemeName) => {
    // Remove existing theme classes from both html and body
    document.documentElement.classList.remove('theme-classic-taco', 'theme-guacamole', 'theme-salsa');
    document.body.classList.remove('theme-classic-taco', 'theme-guacamole', 'theme-salsa');
    
    // Add new theme class
    const themeClass = `theme-${theme.toLowerCase().replace(/\s+/g, '-')}`;
    document.documentElement.classList.add(themeClass);
    document.body.classList.add(themeClass);
    
    // Force a style recalculation and repaint
    document.documentElement.offsetHeight;
    document.body.offsetHeight;
    
    // Also try setting CSS variables directly as backup
    let primaryColor = '217 119 6'; // default amber for Classic Taco
    
    if (theme === 'Classic Taco') {
      primaryColor = '217 119 6'; // amber-600
    } else if (theme === 'Guacamole') {
      primaryColor = '101 163 13'; // lime-600
    } else if (theme === 'Salsa') {
      primaryColor = '225 29 72'; // rose-600
    }
    
    document.documentElement.style.setProperty('--primary', primaryColor);
    
    // Dispatch custom event to notify other components about theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  };

  const handleCancel = () => {
    // Reset to original values and revert theme
    if (originalThemeRef.current) {
      setSelectedTheme(originalThemeRef.current);
      applyTheme(originalThemeRef.current);
      // Revert cache to original theme
      settingsService.setCachedTheme(originalThemeRef.current);
    }
    if (settings) {
      setSelectedEmoji(settings.defaultEmoji);
    }
    onClose();
  };

  const isDirty = initialSnapshot
    ? initialSnapshot.theme !== selectedTheme || initialSnapshot.emoji !== selectedEmoji
    : true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
          <DialogDescription>
            Customize your TaskTaco experience with themes and default emojis.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Theme Picker */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="space-y-2">
              {Object.values(AVAILABLE_THEMES).map((theme) => {
                const config = THEME_CONFIG[theme];
                return (
                  <div key={theme} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={theme}
                      name="theme"
                      value={theme}
                      checked={selectedTheme === theme}
                      onChange={(e) => {

                        setSelectedTheme(e.target.value as ThemeName);
                      }}
                      className="w-4 h-4 text-tasktaco-600 border-gray-300 focus:ring-tasktaco-500"
                      aria-checked={selectedTheme === theme}
                    />
                    <label htmlFor={theme} className="flex items-center gap-3 cursor-pointer flex-1">
                      <span className="text-lg">{config.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium">{config.name}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <Label htmlFor="emoji">Default Task Emoji</Label>
            <div className="grid grid-cols-5 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`p-2 text-lg border rounded hover:bg-accent transition-colors ${
                    selectedEmoji === emoji 
                      ? 'border-tasktaco-500 bg-tasktaco-50' 
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded p-3 bg-card" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selectedEmoji}</span>
                <span className="font-medium">{THEME_CONFIG[selectedTheme].name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {THEME_CONFIG[selectedTheme].description}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !isDirty} style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}