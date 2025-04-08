import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createNotification } from '../services/notificationService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      // Create welcome notification when user logs in
      if (user) {
        createNotification({
          userId: user.uid,
          title: 'Welcome to FlowZone',
          message: 'Start managing your tasks and schedule efficiently!',
          type: 'system'
        });
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
