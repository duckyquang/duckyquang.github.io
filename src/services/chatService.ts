import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import { ChatMessage, ChatSession } from '../models/Chat';

// Collection references
const chatSessionsCollection = collection(firestore, 'chatSessions');
const chatMessagesCollection = collection(firestore, 'chatMessages');

// Create a new chat session
export const createChatSession = async (sessionData: Omit<ChatSession, 'id'>) => {
  const docRef = await addDoc(chatSessionsCollection, sessionData);
  return { id: docRef.id, ...sessionData };
};

// Get all chat sessions for a user
export const getUserChatSessions = async (userId: string) => {
  const q = query(
    chatSessionsCollection, 
    where('userId', '==', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatSession));
};

// Get a specific chat session
export const getChatSession = async (sessionId: string): Promise<ChatSession | null> => {
  const docRef = doc(firestore, 'chatSessions', sessionId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ChatSession;
  } else {
    return null;
  }
};

// Update chat session title
export const updateChatSessionTitle = async (sessionId: string, title: string) => {
  const sessionRef = doc(firestore, 'chatSessions', sessionId);
  await updateDoc(sessionRef, { title });
};

// Send a message
export const sendMessage = async (messageData: Omit<ChatMessage, 'id'>, sessionId: string) => {
  const message = {
    ...messageData,
    sessionId,
    timestamp: new Date()
  };
  
  const docRef = await addDoc(chatMessagesCollection, message);
  
  // Update the session's last message timestamp
  const sessionRef = doc(firestore, 'chatSessions', sessionId);
  await updateDoc(sessionRef, { 
    lastMessageTimestamp: new Date() 
  });
  
  return { id: docRef.id, ...message };
};

// Get all messages for a session
export const getChatMessages = async (sessionId: string) => {
  const q = query(
    chatMessagesCollection, 
    where('sessionId', '==', sessionId),
    orderBy('timestamp', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChatMessage));
};

// Placeholder function for AI response generation
// In a real app, this would call an external AI service like OpenAI
const generateAIResponse = async (userMessage: string, userId: string): Promise<string> => {
  // Simple response logic based on keywords
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your FlowZone assistant. How can I help you today?";
  }
  
  if (lowerMessage.includes('task') && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
    return "I can help you create a task. What's the title of your task?";
  }
  
  if (lowerMessage.includes('calendar') || lowerMessage.includes('schedule')) {
    return "I can help you manage your calendar. Would you like to view your upcoming events or schedule a new one?";
  }
  
  if (lowerMessage.includes('timer') || lowerMessage.includes('focus')) {
    return "The Pomodoro technique can help you stay focused. Would you like me to set up a focus timer for you?";
  }
  
  if (lowerMessage.includes('help')) {
    return "I can help you with task management, scheduling, focus techniques, and productivity tips. What would you like assistance with?";
  }
  
  // Default response
  return "I'm here to help you be more productive. You can ask me about tasks, scheduling, focus techniques, or productivity tips.";
}; 