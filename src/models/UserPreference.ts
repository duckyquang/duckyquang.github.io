export interface UserPreference {
  userId: string;
  theme: 'light' | 'dark';
  workHours: {
    start: string; // Format: "HH:MM"
    end: string; // Format: "HH:MM"
  };
  workDays: number[]; // 0-6, where 0 is Sunday
  focusTime: number; // Default focus session length in minutes
  breakTime: number; // Default break time in minutes
  notifications: {
    email: boolean;
    browser: boolean;
    taskReminders: boolean;
    eventReminders: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
} 