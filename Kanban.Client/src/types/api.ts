export type BoardDto = { id: number; name: string; description?: string };
export type ColumnDto = { id: number; boardId: number; name: string; order: number };
export type TaskDto = { 
  id: number; 
  columnId: number; 
  title: string; 
  description: string; 
  status: string; 
  priority: string; 
  order: number;
  dueDate?: string;
  labels: string[];
  checklist: { id: string; text: string; done: boolean }[];
  stickers: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaskRequest = { 
  columnId: number; 
  title: string; 
  description: string; 
  status: string; 
  priority: string;
  dueDate?: string;
  labels?: string[];
  checklist?: { id: string; text: string; done: boolean }[];
  stickers?: string[];
};
export type UpdateTaskRequest = { 
  title: string; 
  description: string; 
  status: string; 
  priority: string;
  dueDate?: string; // ISO date string - .NET will parse automatically
  labels?: string[];
  checklist?: { id: string; text: string; done: boolean }[];
  stickers?: string[];
};
export type MoveTaskRequest = { columnId: number; order: number };

// User Profile & Settings Types
export type UserProfileDto = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
};

export type UpdateUserProfileRequest = {
  name: string;
  email: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type UserSettingsDto = {
  theme: string;
  defaultEmoji: string;
  availableThemes: string[];
};

export type UpdateUserSettingsRequest = {
  theme: string;
  defaultEmoji: string;
};
