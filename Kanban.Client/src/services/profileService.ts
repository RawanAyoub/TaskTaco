import type { UserProfile, UpdateUserProfileRequest, ChangePasswordRequest } from '../types/user';

const API_BASE = '/api';

class ProfileService {
  async getUserProfile(): Promise<UserProfile> {
    // Import auth service dynamically to get proper auth headers
    const { authService } = await import('./auth');
    const authHeaders = authService.getAuthHeader();

    const response = await fetch(`${API_BASE}/user/profile`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  }

  async updateUserProfile(profile: UpdateUserProfileRequest): Promise<UserProfile> {
    // Import auth service dynamically to get proper auth headers
    const { authService } = await import('./auth');
    const authHeaders = authService.getAuthHeader();

    const response = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return response.json();
  }

  async uploadProfilePicture(file: File): Promise<UserProfile> {
    // Import auth service dynamically to get proper auth headers
    const { authService } = await import('./auth');
    const authHeaders = authService.getAuthHeader();

    const formData = new FormData();
    formData.append('file', file); // Backend expects parameter name 'file'

    const response = await fetch(`${API_BASE}/profile/upload-picture`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        // Don't set Content-Type for FormData - browser sets it automatically
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile picture');
    }

    return response.json();
  }

  async deleteProfilePicture(): Promise<void> {
    // Import auth service dynamically to get proper auth headers
    const { authService } = await import('./auth');
    const authHeaders = authService.getAuthHeader();

    const response = await fetch(`${API_BASE}/profile/delete-picture`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete profile picture');
    }
  }

  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    // Import auth service dynamically to get proper auth headers
    const { authService } = await import('./auth');
    const authHeaders = authService.getAuthHeader();

    const response = await fetch(`${API_BASE}/user/password`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to change password');
    }
  }

  validateProfilePicture(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, and GIF images are allowed' };
    }

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return { isValid: false, error: 'Only JPG, PNG, and GIF files are allowed' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size must be less than 5MB' };
    }

    return { isValid: true };
  }
}

export const profileService = new ProfileService();