import React, { useMemo, useState } from 'react';
import {
  Box,
  Fab,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Chat, Close, Send } from '@mui/icons-material';

type ChatMessage = {
  id: number;
  sender: 'user' | 'support' | 'system';
  text: string;
  time: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'system',
    text: 'Welcome to PAI Portal chat! This is your place to connect with team members and collaborators.',
    time: 'Now',
  },
];

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatWidget: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    const nextMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: trimmed,
      time: formatTime(new Date()),
    };

    setMessages((current) => [...current, nextMessage]);
    setDraft('');
  };

  const messageElements = useMemo(
    () =>
      messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
            mb: 1,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              maxWidth: '100%',
              backgroundColor:
                message.sender === 'user'
                  ? theme.palette.primary.light
                  : theme.palette.action.hover,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.text}
            </Typography>
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {message.time}
          </Typography>
        </Box>
      )),
    [messages, theme.palette.action.hover, theme.palette.primary.light]
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: (theme) => theme.zIndex.drawer + 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 1,
      }}
    >
      {open ? (
        <Paper
          elevation={12}
          sx={{
            width: 410,
            maxWidth: 'calc(100vw - 32px)',
            minHeight: 650,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box>
              <Typography variant="subtitle1">Team Chat</Typography>
              <Typography variant="caption" color="text.secondary">
                Private messages and collaboration
              </Typography>
            </Box>
            <IconButton size="small" onClick={toggleOpen} aria-label="Close chat">
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1.5,
              flexGrow: 1,
              overflowY: 'auto',
              backgroundColor: theme.palette.background.default,
            }}
          >
            {messageElements}
          </Box>

          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                sx={{ alignSelf: 'flex-end' }}
                aria-label="Send message"
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Fab color="primary" onClick={toggleOpen} aria-label="Open chat" size="medium">
          <Chat />
        </Fab>
      )}
    </Box>
  );
};

export default ChatWidget;
