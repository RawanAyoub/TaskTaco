import { api } from './http';
import type { UserSettingsResponse, UpdateUserSettingsRequest } from '../types/user';

class SettingsService {
  async getUserSettings(): Promise<UserSettingsResponse> {
    return api<UserSettingsResponse>('/user/settings');
  }

  async updateUserSettings(settings: UpdateUserSettingsRequest): Promise<UserSettingsResponse> {
    return api<UserSettingsResponse>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Local storage helpers for immediate UI updates
  getCachedTheme(): string {
    return localStorage.getItem('color-theme') || 'Classic Taco';
  }

  setCachedTheme(theme: string): void {
    localStorage.setItem('color-theme', theme);
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