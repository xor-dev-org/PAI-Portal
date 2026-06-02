import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Chat, Close, Send } from '@mui/icons-material';

type ChatMessage = {
  id: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
};

type Conversation = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
};

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: 'Ava Thompson',
    role: 'Procurement Lead',
    avatar: 'AT',
    lastMessage: 'Please review the new vendor shortlist.',
    lastTime: '09:42 AM',
    unread: 2,
    messages: [
      { id: 1, sender: 'other', text: 'Hi! I shared the vendor shortlist for review.', time: '09:10 AM' },
      { id: 2, sender: 'me', text: 'Thanks, I will confirm it before noon.', time: '09:18 AM' },
      { id: 3, sender: 'other', text: 'Please review the new vendor shortlist.', time: '09:42 AM' },
    ],
  },
  {
    id: 2,
    name: 'Daniel Reed',
    role: 'Inventory Manager',
    avatar: 'DR',
    lastMessage: 'The shipment ETA has been updated.',
    lastTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 1, sender: 'other', text: 'The shipment ETA has been updated.', time: 'Yesterday' },
    ],
  },
  {
    id: 3,
    name: 'Sophia Chen',
    role: 'Operations Coordinator',
    avatar: 'SC',
    lastMessage: 'The delivery schedule is ready.',
    lastTime: 'Mon',
    unread: 1,
    messages: [
      { id: 1, sender: 'other', text: 'The delivery schedule is ready.', time: 'Mon' },
    ],
  },
];

const initialSelectedConversationId = initialConversations[0]!.id;

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatWidget: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState(initialSelectedConversationId);
  const [draft, setDraft] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? conversations[0],
    [conversations, selectedId]
  );

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'me',
      text: trimmed,
      time: formatTime(new Date()),
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: trimmed,
              lastTime: 'Now',
              unread: 0,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    );
    setDraft('');
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: (theme) => theme.zIndex.drawer + 10 }}>
      {open ? (
        <Paper elevation={12} sx={{ width: 900, maxWidth: 'calc(100vw - 24px)', height: 680, maxHeight: 'calc(100vh - 24px)', display: 'flex', overflow: 'hidden', borderRadius: 3 }}>
          <Box sx={{ width: 320, borderRight: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6">Messages</Typography>
              <Typography variant="body2" color="text.secondary">Chat with your team members</Typography>
            </Box>

            <Box sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
              <List disablePadding>
                {conversations.map((conversation) => (
                  <ListItem key={conversation.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton selected={selectedConversation?.id === conversation.id} onClick={() => setSelectedId(conversation.id)} sx={{ borderRadius: 2, mx: 1 }}>
                      <ListItemAvatar>
                        <Badge badgeContent={conversation.unread || null} color="primary">
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{conversation.avatar}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText primary={conversation.name} secondary={conversation.lastMessage} primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }}>
              <Box>
                <Typography variant="subtitle1">{selectedConversation?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedConversation?.role}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Online" color="success" size="small" />
                <IconButton onClick={toggleOpen} aria-label="Close chat"><Close /></IconButton>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto', backgroundColor: theme.palette.background.default }}>
              {selectedConversation?.messages.map((message) => (
                <Box key={message.id} sx={{ display: 'flex', justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start', mb: 1.2 }}>
                  <Paper elevation={0} sx={{ maxWidth: '75%', p: 1.25, borderRadius: 2, bgcolor: message.sender === 'me' ? theme.palette.primary.main : theme.palette.action.hover, color: message.sender === 'me' ? theme.palette.primary.contrastText : 'inherit' }}>
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>{message.time}</Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            <Divider />
            <Box sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder={`Message ${selectedConversation?.name}...`} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSend(); } }} />
                <IconButton color="primary" onClick={handleSend} aria-label="Send message"><Send /></IconButton>
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Fab color="primary" onClick={toggleOpen} aria-label="Open chat" size="large"><Chat /></Fab>
      )}
    </Box>
  );
};

export default ChatWidget;
