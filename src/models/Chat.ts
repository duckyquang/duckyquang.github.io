export interface ChatMessage {
  id?: string;
  userId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id?: string;
  userId: string;
  title: string;
  lastMessageTimestamp: Date;
  createdAt: Date;
} 