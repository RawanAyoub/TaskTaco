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
              <Label htmlFor="defaultEmoji">Default Task Emoji</Label>
              <Input
                id="defaultEmoji"
                type="text"
                value={formData.defaultEmoji}
                onChange={(e) => handleInputChange('defaultEmoji', e.target.value)}
                placeholder="🌮"
                maxLength={10}
                className="text-center text-2xl"
              />
              <p className="text-xs text-muted-foreground">
                This emoji will be used as the default for new tasks
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
              <Button type="submit" disabled={saving}>
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