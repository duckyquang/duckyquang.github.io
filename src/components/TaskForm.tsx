import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createTask } from '../services/taskService';
import { Task } from '../models/Task';

interface TaskFormProps {
  onTaskCreated: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to create a task');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const newTask: Omit<Task, 'id'> = {
        userId: currentUser.uid,
        title,
        description,
        status: 'pending',
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
        actualTime: 0,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const createdTask = await createTask(newTask);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setEstimatedTime('');
      
      // Notify parent component
      onTaskCreated(createdTask);
    } catch (err: any) {
      setError('Failed to create task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create New Task
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the form below to create a new task
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <div className="mt-1">
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700">
              Estimated Time (minutes)
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="estimatedTime"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                min="0"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 