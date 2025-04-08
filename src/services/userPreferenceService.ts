import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { firestore } from './firebase';
import { UserPreference } from '../models/UserPreference';

// Get user preferences
export const getUserPreferences = async (userId: string): Promise<UserPreference | null> => {
  const docRef = doc(firestore, 'userPreferences', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserPreference;
  } else {
    return null;
  }
};

// Create default user preferences
export const createDefaultUserPreferences = async (userId: string): Promise<UserPreference> => {
  const now = new Date();
  const defaultPreferences: UserPreference = {
    userId,
    theme: 'light',
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    focusTime: 25, // 25 minutes (Pomodoro technique)
    breakTime: 5, // 5 minutes
    notifications: {
      email: true,
      browser: true,
      taskReminders: true,
      eventReminders: true
    },
    createdAt: now,
    updatedAt: now
  };
  
  await setDoc(doc(firestore, 'userPreferences', userId), defaultPreferences);
  return defaultPreferences;
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string, 
  preferences: Partial<Omit<UserPreference, 'userId' | 'createdAt'>>
): Promise<UserPreference> => {
  const docRef = doc(firestore, 'userPreferences', userId);
  const updates = {
    ...preferences,
    updatedAt: new Date()
  };
  
  await updateDoc(docRef, updates);
  
  // Get the updated document
  const updatedDoc = await getDoc(docRef);
  return updatedDoc.data() as UserPreference;
}; 