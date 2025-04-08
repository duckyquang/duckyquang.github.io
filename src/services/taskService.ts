import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Task, SubTask } from '../models/Task';

// Collection references
const tasksCollection = collection(firestore, 'tasks');
const subTasksCollection = collection(firestore, 'subTasks');

// Create a new task
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  const newTask = {
    ...task,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(tasksCollection, newTask);
  return { id: docRef.id, ...newTask };
};

// Get all tasks for a user
export const getUserTasks = async (userId: string) => {
  const q = query(
    tasksCollection, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Task));
};

// Update a task
export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
  const taskRef = doc(firestore, 'tasks', id);
  const updates = {
    ...task,
    updatedAt: new Date()
  };
  
  await updateDoc(taskRef, updates);
  return { id, ...updates };
};

// Delete a task
export const deleteTask = async (id: string) => {
  const taskRef = doc(firestore, 'tasks', id);
  await deleteDoc(taskRef);
  
  // Also delete all subtasks
  const subTasksQuery = query(subTasksCollection, where('taskId', '==', id));
  const subTasksSnapshot = await getDocs(subTasksQuery);
  
  const deletePromises = subTasksSnapshot.docs.map(doc => 
    deleteDoc(doc.ref)
  );
  
  await Promise.all(deletePromises);
  return id;
};

// Create a subtask
export const createSubTask = async (subTask: Omit<SubTask, 'id' | 'createdAt'>) => {
  const now = new Date();
  const newSubTask = {
    ...subTask,
    createdAt: now
  };
  
  const docRef = await addDoc(subTasksCollection, newSubTask);
  return { id: docRef.id, ...newSubTask };
};

// Get all subtasks for a task
export const getTaskSubTasks = async (taskId: string) => {
  const q = query(
    subTasksCollection, 
    where('taskId', '==', taskId),
    orderBy('createdAt', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SubTask));
};

// Update a subtask
export const updateSubTask = async (id: string, subTask: Partial<Omit<SubTask, 'id' | 'createdAt'>>) => {
  const subTaskRef = doc(firestore, 'subTasks', id);
  await updateDoc(subTaskRef, subTask);
  return { id, ...subTask };
};

// Delete a subtask
export const deleteSubTask = async (id: string) => {
  const subTaskRef = doc(firestore, 'subTasks', id);
  await deleteDoc(subTaskRef);
  return id;
}; 