import { Task } from '../models/Task';
import { createNotification } from '../services/notificationService';

export const checkTasksForNotifications = async (userId: string, tasks: Task[]) => {
  const now = new Date();
  
  // Check for tasks due within the next 24 hours
  const tasksToNotify = tasks.filter(task => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Notify if task is due within 24 hours and not completed
    return hoursDiff > 0 && hoursDiff <= 24 && task.status !== 'completed';
  });
  
  // Create notifications for each task
  for (const task of tasksToNotify) {
    const dueDate = new Date(task.dueDate!);
    const formattedDate = dueDate.toLocaleString();
    
    await createNotification({
      userId,
      title: 'Task Due Soon',
      message: `"${task.title}" is due on ${formattedDate}`,
      type: 'task',
      relatedItemId: task.id
    });
  }
  
  return tasksToNotify.length;
}; 