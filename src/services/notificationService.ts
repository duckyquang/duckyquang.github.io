import { firestore } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'system';
  read: boolean;
  relatedItemId?: string; // ID of related task or event
  createdAt: Date;
}

// Collection reference
const notificationsCollection = collection(firestore, 'notifications');

// Create a new notification
export const createNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
  const now = new Date();
  const newNotification = {
    ...notification,
    read: false,
    createdAt: now
  };
  
  const docRef = await addDoc(notificationsCollection, newNotification);
  
  // Also trigger browser notification if supported
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/logo192.png'
    });
  }
  
  return { id: docRef.id, ...newNotification };
};

// Get all notifications for a user
export const getUserNotifications = async (userId: string) => {
  const q = query(
    notificationsCollection, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Notification));
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(firestore, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const q = query(
    notificationsCollection, 
    where('userId', '==', userId),
    where('read', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map(doc => 
    updateDoc(doc.ref, { read: true })
  );
  
  await Promise.all(updatePromises);
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  const notificationRef = doc(firestore, 'notifications', notificationId);
  await deleteDoc(notificationRef);
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}; 