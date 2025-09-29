// TaskTaco Priority Levels
export const Priority = {
  Low: 1,
  Medium: 2,
  High: 3
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

// Helper functions for Priority
export const PriorityLabels = {
  [Priority.Low]: 'Low',
  [Priority.Medium]: 'Medium', 
  [Priority.High]: 'High'
} as const;

export const PriorityColors = {
  [Priority.Low]: 'bg-blue-100 text-blue-800 border-blue-200',
  [Priority.Medium]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [Priority.High]: 'bg-red-100 text-red-800 border-red-200'
} as const;

export function getPriorityLabel(priority: Priority): string {
  return PriorityLabels[priority] || 'Medium';
}

export function getPriorityColor(priority: Priority): string {
  return PriorityColors[priority] || PriorityColors[Priority.Medium];
}