import type { UserSettings, UpdateUserSettingsRequest } from '../types/user';

const API_BASE = '/api';

class SettingsService {
  async getUserSettings(): Promise<UserSettings> {
    const response = await fetch(`${API_BASE}/users/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }

    return response.json();
  }

  async updateUserSettings(settings: UpdateUserSettingsRequest): Promise<UserSettings> {
    const response = await fetch(`${API_BASE}/users/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }

    return response.json();
  }

  // Local storage helpers for immediate UI updates
  getCachedTheme(): string {
    return localStorage.getItem('tasktaco-theme') || 'Classic Taco';
  }

  setCachedTheme(theme: string): void {
    localStorage.setItem('tasktaco-theme', theme);
  }

  getCachedDefaultEmoji(): string {
    return localStorage.getItem('tasktaco-default-emoji') || '🌮';
  }

  setCachedDefaultEmoji(emoji: string): void {
    localStorage.setItem('tasktaco-default-emoji', emoji);
  }

  clearCache(): void {
    localStorage.removeItem('tasktaco-theme');
    localStorage.removeItem('tasktaco-default-emoji');
  }
}

export const settingsService = new SettingsService();