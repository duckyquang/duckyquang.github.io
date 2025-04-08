import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ],
  loading: false,
  error: null,
};

// This would connect to your AI backend in a real implementation
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      
      // Simulate AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm an AI assistant. You said: "${message}"`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      
      return { userMessage, aiMessage };
    } catch (error) {
      return rejectWithValue('Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [
        {
          id: '1',
          content: 'Hello! How can I help you today?',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        },
      ];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages.push(action.payload.userMessage);
      state.messages.push(action.payload.aiMessage);
      state.loading = false;
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
