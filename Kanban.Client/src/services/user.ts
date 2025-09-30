import { api } from './http';
import type { 
  UserProfileDto, 
  UpdateUserProfileRequest,
  ChangePasswordRequest,
  UserSettingsDto, 
  UpdateUserSettingsRequest 
} from '@/types/api';

export const UserService = {
  // Profile endpoints
  getProfile: () => api<UserProfileDto>('/user/profile'),
  updateProfile: (req: UpdateUserProfileRequest) => api<void>('/user/profile', { 
    method: 'PUT', 
    body: JSON.stringify(req) 
  }),

  // Password change endpoint
  changePassword: (req: ChangePasswordRequest) => api<void>('/user/password', { 
    method: 'PATCH', 
    body: JSON.stringify(req) 
  }),

  // Settings endpoints
  getSettings: () => api<UserSettingsDto>('/user/settings'),
  updateSettings: (req: UpdateUserSettingsRequest) => api<void>('/user/settings', { 
    method: 'PUT', 
    body: JSON.stringify(req) 
  }),
};