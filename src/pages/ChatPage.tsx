import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/ChatInterface';
import { ChatSession } from '../models/Chat';
import { getUserChatSessions, updateChatSessionTitle } from '../services/chatService';

const ChatPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Memoize fetchSessions to avoid dependency issues
  const fetchSessions = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userSessions = await getUserChatSessions(currentUser.uid);
      setSessions(userSessions);
      
      // Set the first session as active if there is one and no active session
      if (userSessions.length > 0 && !activeSessionId) {
        setActiveSessionId(userSessions[0].id);
      }
    } catch (err: any) {
      setError('Failed to fetch chat sessions: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeSessionId]);

  useEffect(() => {
    if (currentUser) {
      fetchSessions();
    }
  }, [currentUser, fetchSessions]);

  const handleNewSession = (session: ChatSession) => {
    setSessions([session, ...sessions]);
    setActiveSessionId(session.id);
  };

  const handleSessionClick = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const startEditingTitle = (sessionId: string, currentTitle: string) => {
    setEditingTitle(sessionId);
    setNewTitle(currentTitle);
  };

  const handleTitleUpdate = async (sessionId: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateChatSessionTitle(sessionId, newTitle);
      
      // Update the session in the local state
      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, title: newTitle } : session
      ));
      
      setEditingTitle(null);
    } catch (err: any) {
      setError('Failed to update session title: ' + err.message);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 bg-white rounded-lg shadow-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
                    <button
                      onClick={() => {
                        if (currentUser) {
                          const newSession = {
                            userId: currentUser.uid,
                            title: 'New Conversation',
                            lastMessageTimestamp: new Date(),
                            createdAt: new Date()
                          };
                          handleNewSession(newSession as ChatSession);
                        }
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-4">Loading sessions...</div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No conversations yet</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {sessions.map(session => (
                        <li key={session.id} className="py-3">
                          <div 
                            className={`flex justify-between items-center ${activeSessionId === session.id ? 'bg-indigo-50 -mx-4 px-4' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              {editingTitle === session.id ? (
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleTitleUpdate(session.id!)}
                                    className="ml-2 text-indigo-600 hover:text-indigo-900"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  className="cursor-pointer"
                                  onClick={() => handleSessionClick(session.id!)}
                                >
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {session.title}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(new Date(session.lastMessageTimestamp))}
                                  </p>
                                </div>
                              )}
                            </div>
                            {editingTitle !== session.id && (
                              <button
                                onClick={() => startEditingTitle(session.id!, session.title)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="md:col-span-3 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ height: '70vh' }}>
                  {activeSessionId ? (
                    <ChatInterface 
                      sessionId={activeSessionId} 
                      onNewSession={handleNewSession} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to FlowZone AI Assistant</h2>
                        <p className="text-gray-600 mb-6">Start a new conversation or select an existing one.</p>
                        <button
                          onClick={() => {
                            if (currentUser) {
                              const newSession = {
                                userId: currentUser.uid,
                                title: 'New Conversation',
                                lastMessageTimestamp: new Date(),
                                createdAt: new Date()
                              };
                              handleNewSession(newSession as ChatSession);
                            }
                          }}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Start New Conversation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage; 