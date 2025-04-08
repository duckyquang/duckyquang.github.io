import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../models/Task';
import { updateTask } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

export interface TaskTimerProps {
  task: Task;
  onComplete: (updatedTask: Task) => void;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ task, onComplete }) => {
  const { currentUser } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(task.actualTime || 0);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 minutes in seconds
  const [breakTime, setBreakTime] = useState(5 * 60); // 5 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now() - (timeElapsed * 1000);
    
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const start = startTimeRef.current || now;
      const elapsed = Math.floor((now - start) / 1000);
      
      setTimeElapsed(elapsed);
      
      // Check if timer is complete
      if (timerMode === 'focus' && elapsed >= focusTime) {
        handleTimerComplete();
      } else if (timerMode === 'break' && elapsed >= breakTime) {
        handleBreakComplete();
      }
    }, 1000);
  };

  const pauseTimer = async () => {
    if (!isRunning) return;
    
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Save the current time to the task
    try {
      if (!currentUser) throw new Error('User not authenticated');
      
      const updatedTask = {
        ...task,
        actualTime: Math.round(timeElapsed * 100) / 100, // Round to 2 decimal places
        updatedAt: new Date()
      };
      
      await updateTask(task.id!, updatedTask);
      setSuccess('Progress saved');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Call the onComplete callback with the updated task
      onComplete(updatedTask);
    } catch (err: any) {
      setError('Failed to save progress: ' + err.message);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeElapsed(0);
    startTimeRef.current = null;
  };

  const handleTimerComplete = () => {
    pauseTimer();
    
    // Play sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Error playing sound:', e));
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus time complete!', {
        body: `You've completed a focus session for "${task.title}"`,
        icon: '/logo192.png'
      });
    }
    
    // Update task with time spent
    const updatedTask = {
      ...task,
      actualTime: (task.actualTime || 0) + Math.floor(timeElapsed / 60)
    };
    
    updateTask(task.id!, { actualTime: updatedTask.actualTime })
      .catch(err => console.error('Failed to update task time:', err));
    
    // Switch to break mode
    setTimerMode('break');
    setTimeElapsed(0);
    startTimeRef.current = null;
  };

  const handleBreakComplete = () => {
    pauseTimer();
    
    // Play sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Error playing sound:', e));
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Break time complete!', {
        body: 'Ready to start another focus session?',
        icon: '/logo192.png'
      });
    }
    
    // Switch back to focus mode
    setTimerMode('focus');
    setTimeElapsed(0);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    const totalTime = timerMode === 'focus' ? focusTime : breakTime;
    return (timeElapsed / totalTime) * 100;
  };

  const completeTask = async () => {
    try {
      if (!currentUser) throw new Error('User not authenticated');
      
      // Stop the timer if it's running
      if (isRunning && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setIsRunning(false);
      }
      
      const updatedTask = {
        ...task,
        status: 'completed' as const,
        actualTime: Math.round(timeElapsed * 100) / 100, // Round to 2 decimal places
        updatedAt: new Date()
      };
      
      await updateTask(task.id!, updatedTask);
      setSuccess('Task marked as completed');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Call the onComplete callback with the updated task
      onComplete(updatedTask);
    } catch (err: any) {
      setError('Failed to complete task: ' + err.message);
      
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      <div className="text-center">
        <div className="text-5xl font-bold mb-4">
          {formatTime(timeElapsed)}
        </div>
        
        {task.estimatedTime !== undefined && task.estimatedTime > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Pause
            </button>
          )}
          
          <button
            onClick={completeTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Task
          </button>
        </div>
      </div>
      
      {task.estimatedTime !== undefined && task.estimatedTime > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Estimated time: {task.estimatedTime} minutes</p>
          <p>Time spent so far: {task.actualTime || 0} minutes</p>
        </div>
      )}
    </div>
  );
};

export default TaskTimer; 