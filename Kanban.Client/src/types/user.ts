// User Settings Types
export interface UserSettings {
  id: number;
  userId: string;
  theme: string;
  defaultEmoji: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserSettingsRequest {
  theme: string;
  defaultEmoji: string;
}

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Theme Options
export const AVAILABLE_THEMES = {
  CLASSIC_TACO: 'Classic Taco',
  GUACAMOLE: 'Guacamole', 
  SALSA: 'Salsa'
} as const;

export type ThemeName = typeof AVAILABLE_THEMES[keyof typeof AVAILABLE_THEMES];

export const THEME_CONFIG = {
  [AVAILABLE_THEMES.CLASSIC_TACO]: {
    name: 'Classic Taco',
    emoji: '🌮',
    primary: 'hsl(25, 95%, 53%)', // Orange
    description: 'The original TaskTaco experience with warm orange tones'
  },
  [AVAILABLE_THEMES.GUACAMOLE]: {
    name: 'Guacamole', 
    emoji: '🥑',
    primary: 'hsl(84, 69%, 74%)', // Green
    description: 'Fresh and smooth like perfectly ripe avocado'
  },
  [AVAILABLE_THEMES.SALSA]: {
    name: 'Salsa',
    emoji: '🌶️', 
    primary: 'hsl(0, 84%, 60%)', // Red
    description: 'Spicy and energetic red theme for high-intensity work'
  }
} as const;

export function getThemeConfig(theme: ThemeName) {
  return THEME_CONFIG[theme] || THEME_CONFIG[AVAILABLE_THEMES.CLASSIC_TACO];
}