import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../models/Task';
import { getUserTasks, deleteTask, updateTask } from '../services/taskService';

const TaskList: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userTasks = await getUserTasks(currentUser.uid);
        setTasks(userTasks);
      } catch (err: any) {
        setError('Failed to fetch tasks: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser]);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err: any) {
      setError('Failed to update task: ' + err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err: any) {
      setError('Failed to delete task: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>You don't have any tasks yet.</p>
        <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Create Your First Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id!, e.target.value as Task['status'])}
                className="text-sm border rounded p-1"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={() => handleDeleteTask(task.id!)}
                className="text-red-600 hover:text-red-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList; 