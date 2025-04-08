import React, { useEffect, useRef } from 'react';
import { Box, List, ListItem, Paper, Typography } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { RootState } from '../../store';
import { Message } from '../../store/slices/chatSlice';

const ChatPanel: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state: RootState) => state.chat);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading messages...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message: Message) => (
            <React.Fragment key={message.id}>
              <ListItem alignItems="flex-start" sx={{
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    maxWidth: '70%',
                    backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: message.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </ListItem>
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
    </Box>
  );
};

export default ChatPanel;
