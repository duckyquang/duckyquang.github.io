export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubTask {
  id?: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
} 