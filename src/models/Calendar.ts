export interface CalendarEvent {
  id?: string;
  userId: string;
  googleEventId?: string; // ID from Google Calendar
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay: boolean;
  recurrence?: string;
  attendees?: string[];
  taskId?: string; // Reference to a task if this event is related to a task
  createdAt: Date;
  updatedAt: Date;
} 