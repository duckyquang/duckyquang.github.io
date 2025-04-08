import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Task } from '../models/Task';
import { getUserTasks } from '../services/taskService';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
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

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setShowTaskForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {showTaskForm ? 'Cancel' : 'Create Task'}
              </button>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {showTaskForm && (
                <div className="mb-8">
                  <TaskForm onTaskCreated={handleTaskCreated} />
                </div>
              )}
              
              <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your tasks and track your progress
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {loading ? (
                    <div className="text-center py-4">Loading tasks...</div>
                  ) : (
                    <TaskList />
                  )}
                </div>
              </div>
              
              <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Welcome, {currentUser?.email}!</h3>
                  <p className="mt-2 text-gray-600">
                    This is your personal dashboard. We're working on adding more features like:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600">
                    <li>Calendar integration</li>
                    <li>Timer functionality</li>
                    <li>AI chat assistant</li>
                    <li>Task prioritization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
