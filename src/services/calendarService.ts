import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import { firestore } from './firebase';
import { CalendarEvent } from '../models/Calendar';

// Collection reference
const eventsCollection = collection(firestore, 'calendarEvents');

// Create a new calendar event
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  const newEvent = {
    ...event,
    createdAt: now,
    updatedAt: now
  };
  
  const docRef = await addDoc(eventsCollection, newEvent);
  return { id: docRef.id, ...newEvent };
};

// Get all calendar events for a user
export const getUserEvents = async (userId: string) => {
  const q = query(
    eventsCollection, 
    where('userId', '==', userId),
    orderBy('startTime', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as CalendarEvent));
};

// Update a calendar event
export const updateCalendarEvent = async (id: string, event: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => {
  const eventRef = doc(firestore, 'calendarEvents', id);
  const updates = {
    ...event,
    updatedAt: new Date()
  };
  
  await updateDoc(eventRef, updates);
  return { id, ...updates };
};

// Delete a calendar event
export const deleteCalendarEvent = async (id: string) => {
  const eventRef = doc(firestore, 'calendarEvents', id);
  await deleteDoc(eventRef);
  return id;
};

// Google Calendar API integration
export const syncWithGoogleCalendar = async (userId: string, accessToken: string) => {
  try {
    // This is a placeholder for the actual Google Calendar API integration
    // You would use the accessToken to fetch events from Google Calendar
    // and then sync them with your local database
    
    // Example of how you might fetch events from Google Calendar
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch events from Google Calendar');
    }
    
    const data = await response.json();
    
    // Process the events and sync with your database
    // This is just a placeholder implementation
    const events = data.items.map((item: any) => ({
      userId,
      googleEventId: item.id,
      title: item.summary,
      description: item.description || '',
      startTime: new Date(item.start.dateTime || item.start.date),
      endTime: new Date(item.end.dateTime || item.end.date),
      location: item.location || '',
      isAllDay: !item.start.dateTime,
      recurrence: item.recurrence ? item.recurrence.join(',') : undefined,
      attendees: item.attendees ? item.attendees.map((a: any) => a.email) : [],
    }));
    
    // For each event, check if it exists in the database and update or create accordingly
    // This is a simplified implementation
    for (const event of events) {
      const q = query(
        eventsCollection,
        where('userId', '==', userId),
        where('googleEventId', '==', event.googleEventId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new event
        await createCalendarEvent(event);
      } else {
        // Update existing event
        const docId = querySnapshot.docs[0].id;
        await updateCalendarEvent(docId, event);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    return false;
  }
}; 