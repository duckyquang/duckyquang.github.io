import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskTimer from '../components/TaskTimer';
import { Task } from '../models/Task';
import { getUserTasks } from '../services/taskService';
import { checkTasksForNotifications } from '../utils/notificationHelpers';

const TasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userTasks = await getUserTasks(currentUser.uid);
        setTasks(userTasks);
        
        // Select the first task by default if available
        if (userTasks.length > 0 && !selectedTask) {
          setSelectedTask(userTasks[0]);
        }
        
        // Check for tasks that need notifications
        await checkTasksForNotifications(currentUser.uid, userTasks);
      } catch (err: any) {
        setError('Failed to fetch tasks: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [currentUser, selectedTask]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setShowTaskForm(false);
    
    // Select the newly created task
    setSelectedTask(newTask);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTimerComplete = (updatedTask: Task) => {
    // Update the task in the list
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
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
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Your Tasks
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Select a task to start the timer
                      </p>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {loading ? (
                        <li className="px-4 py-4 sm:px-6">Loading tasks...</li>
                      ) : tasks.length === 0 ? (
                        <li className="px-4 py-4 sm:px-6">No tasks yet. Create your first task!</li>
                      ) : (
                        tasks.map(task => (
                          <li 
                            key={task.id}
                            className={`px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer ${
                              selectedTask?.id === task.id ? 'bg-indigo-50' : ''
                            }`}
                            onClick={() => handleTaskSelect(task)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`flex-shrink-0 h-4 w-4 rounded-full ${
                                  task.status === 'completed' ? 'bg-green-500' : 
                                  task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
                                }`}></div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status === 'completed' ? 'Completed' : 
                                   task.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedTask ? selectedTask.title : 'Select a Task'}
                      </h3>
                      {selectedTask && (
                        <p className="mt-1 text-sm text-gray-500">
                          {selectedTask.description || 'No description provided'}
                        </p>
                      )}
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      {selectedTask ? (
                        <TaskTimer 
                          task={selectedTask} 
                          onComplete={handleTimerComplete} 
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          Select a task from the list to start the timer
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TasksPage; 