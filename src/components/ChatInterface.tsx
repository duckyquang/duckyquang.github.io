import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage, ChatSession } from '../models/Chat';
import { sendMessage, getChatMessages, createChatSession } from '../services/chatService';

interface ChatInterfaceProps {
  sessionId?: string;
  onNewSession?: (session: ChatSession) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, onNewSession }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoize fetchMessages to avoid dependency issues
  const fetchMessages = useCallback(async () => {
    if (!currentUser || !currentSessionId) return;
    
    try {
      setLoading(true);
      const chatMessages = await getChatMessages(currentSessionId);
      setMessages(chatMessages);
    } catch (err: any) {
      setError('Failed to fetch messages: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentSessionId]);

  // Memoize handleNewSession to avoid dependency issues
  const memoizedHandleNewSession = useCallback((session: ChatSession) => {
    if (onNewSession) {
      onNewSession(session);
    }
  }, [onNewSession]);

  // Fetch messages when session changes
  useEffect(() => {
    if (sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
    }
    
    if (currentSessionId) {
      fetchMessages();
    }
  }, [sessionId, currentSessionId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser) return;
    
    try {
      setLoading(true);
      
      // If no session exists, create one
      if (!currentSessionId) {
        const sessionData = {
          userId: currentUser.uid,
          title: 'New Conversation',
          lastMessageTimestamp: new Date(),
          createdAt: new Date()
        };
        
        const newSession = await createChatSession(sessionData);
        
        setCurrentSessionId(newSession.id);
        memoizedHandleNewSession(newSession);
      }
      
      // Send the message
      const messageData = {
        userId: currentUser.uid,
        content: newMessage,
        isUser: true,
        timestamp: new Date(),
        sessionId: currentSessionId || ''
      };
      
      const message = await sendMessage(messageData, currentSessionId || '');
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Simulate AI response
      setTimeout(async () => {
        const aiMessageData = {
          userId: currentUser.uid,
          content: `I'm an AI assistant. You said: "${newMessage}"`,
          isUser: false,
          timestamp: new Date(),
          sessionId: currentSessionId || ''
        };
        
        const aiMessage = await sendMessage(aiMessageData, currentSessionId || '');
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    } catch (err: any) {
      setError('Failed to send message: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading messages...' : 'No messages yet. Start a conversation!'}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
                    message.isUser 
                      ? 'bg-indigo-100 text-indigo-900' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 