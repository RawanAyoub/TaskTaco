// User Settings Types
export interface UserSettings {
  id: number;
  userId: string;
  theme: string;
  defaultEmoji: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsResponse {
  theme: string;
  defaultEmoji: string;
  availableThemes: string[];
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
    primary: 'hsl(217 119 6)', // amber-600
    description: 'The original TaskTaco experience with warm amber and lime tones'
  },
  [AVAILABLE_THEMES.GUACAMOLE]: {
    name: 'Guacamole', 
    emoji: '🥑',
    primary: 'hsl(101 163 13)', // lime-600
    description: 'Fresh and smooth like perfectly ripe avocado with lime greens'
  },
  [AVAILABLE_THEMES.SALSA]: {
    name: 'Salsa',
    emoji: '🌶️', 
    primary: 'hsl(225 29 72)', // rose-600
    description: 'Spicy and energetic rose and red theme for high-intensity work'
  }
} as const;

export function getThemeConfig(theme: ThemeName) {
  return THEME_CONFIG[theme] || THEME_CONFIG[AVAILABLE_THEMES.CLASSIC_TACO];
}