import React, { useMemo, useState, useEffect, useRef } from 'react';
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
import { Chat, Close, Send, AttachFile, Clear, InsertDriveFile, Download } from '@mui/icons-material';

export type ChatMessage = {
  id: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
  fileName?: string;
  fileUrl?: string;   // Local or remote URL for preview/download
  fileType?: string;  // MIME type or category (e.g., 'image', 'document')
};

export type Conversation = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
  poNumber?: string;
};

interface ChatWidgetProps {
  initialConversations: Conversation[];
  title?: string;
  subtitle?: string;
}

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  initialConversations, 
  title = "Messages", 
  subtitle = "Chat with your team members" 
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-scroll to the bottom whenever a new message lands or chat changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [conversations, open, selectedId]);

  useEffect(() => {
    if (initialConversations.length > 0) {
      const firstId = initialConversations[0].id;
      setSelectedId(firstId);
      setConversations(
        initialConversations.map((c) => c.id === firstId ? { ...c, unread: 0 } : c)
      );
    } else {
      setConversations([]);
      setSelectedId(null);
    }
  }, [initialConversations]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? conversations[0],
    [conversations, selectedId]
  );

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectConversation = (id: number) => {
    setSelectedId(id);
    setConversations((current) =>
      current.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed && !selectedFile || !selectedConversation) return;

    let fileUrl = undefined;
    let fileType = undefined;

    if (selectedFile) {
      // Generate a temporary local browser link for previewing files
      fileUrl = URL.createObjectURL(selectedFile);
      fileType = selectedFile.type.startsWith('image/') ? 'image' : 'document';
    }

    const messageText = trimmed || (fileType === 'image' ? 'Sent an image' : `📄 Attached: ${selectedFile?.name}`);

    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      time: formatTime(new Date()),
      fileName: selectedFile ? selectedFile.name : undefined,
      fileUrl,
      fileType,
    };

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              lastMessage: selectedFile ? (fileType === 'image' ? '📷 Image' : `📄 ${selectedFile.name}`) : trimmed,
              lastTime: 'Now',
              unread: 0,
              messages: [...conversation.messages, newMessage],
            }
          : conversation
      )
    );

    setDraft('');
    clearSelectedFile();
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 60, right: 16, zIndex: (theme) => theme.zIndex.drawer + 10 }}>
      {open ? (
        <Paper elevation={12} sx={{ width: 900, maxWidth: 'calc(100vw - 24px)', height: 680, maxHeight: 'calc(100vh - 24px)', display: 'flex', overflow: 'hidden', borderRadius: 3 }}>
          
          {/* Sidebar */}
          <Box sx={{ width: 320, borderRight: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.default }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6">{title}</Typography>
              <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            </Box>

            <Box sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
              <List disablePadding>
                {conversations.map((conversation) => (
                  <ListItem key={conversation.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      selected={selectedConversation?.id === conversation.id} 
                      onClick={() => handleSelectConversation(conversation.id)}
                      sx={{ borderRadius: 1, mx: 1 }}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={conversation.unread || null} color="primary">
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{conversation.avatar}</Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={conversation.name} 
                        secondary={conversation.lastMessage} 
                        primaryTypographyProps={{ fontWeight: 600 }} 
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>

          {/* Chat Window */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper }}>
              <Box>
                <Typography variant="subtitle1">
                  {selectedConversation?.name} 
                  {selectedConversation?.poNumber && ` (${selectedConversation.poNumber})`}
                </Typography>
                <Typography variant="caption" color="text.secondary">{selectedConversation?.role}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label="Online" color="success" size="small" />
                <IconButton onClick={toggleOpen} aria-label="Close chat"><Close /></IconButton>
              </Box>
            </Box>

            {/* Message Stream */}
            <Box sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto', backgroundColor: theme.palette.background.default }}>
              {selectedConversation?.messages.map((message) => (
                <Box key={message.id} sx={{ display: 'flex', justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start', mb: 1.2 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      maxWidth: '75%', 
                      p: message.fileType === 'image' ? 0.75 : 1.25, // Tighter padding for images
                      borderRadius: 1, 
                      bgcolor: message.sender === 'me' ? theme.palette.primary.main : theme.palette.action.hover, 
                      color: message.sender === 'me' ? theme.palette.primary.contrastText : 'inherit',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Media Render Routing */}
                    {message.fileType === 'image' ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box 
                          component="img" 
                          src={message.fileUrl} 
                          alt={message.fileName} 
                          sx={{ maxWidth: '100%', maxHeight: 240, borderRadius: 1, objectFit: 'cover', display: 'block' }} 
                        />
                        {/* Render caption text beneath image if it exists */}
                        {message.text && message.text !== 'Sent an image' && (
                          <Typography variant="body2" sx={{ mt: 1, px: 0.5 }}>{message.text}</Typography>
                        )}
                      </Box>
                    ) : message.fileType === 'document' ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {/* WhatsApp / Teams Style File Block */}
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: message.sender === 'me' ? 'rgba(255,255,255,0.15)' : theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <InsertDriveFile color={message.sender === 'me' ? "inherit" : "primary"} />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap fontWeight="medium">{message.fileName}</Typography>
                          </Box>
                          <IconButton 
                            size="small" 
                            component="a" 
                            href={message.fileUrl} 
                            download={message.fileName}
                            color="inherit"
                          >
                            <Download size="small" />
                          </IconButton>
                        </Box>
                        {message.text && !message.text.startsWith('📄 Attached:') && (
                          <Typography variant="body2">{message.text}</Typography>
                        )}
                      </Box>
                    ) : (
                      // Plain Text Message Layout
                      <Typography variant="body2">{message.text}</Typography>
                    )}
                    
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5, px: message.fileType === 'image' ? 0.5 : 0 }}>
                      {message.time}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {/* Invisible anchor node to handle smooth scroll pinning */}
              <div ref={messagesEndRef} />
            </Box>

            <Divider />

            {/* Input Action Tray */}
            <Box sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              {selectedFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, px: 1 }}>
                  <Chip 
                    label={`Ready to send: ${selectedFile.name}`} 
                    color="info" 
                    variant="outlined" 
                    onDelete={clearSelectedFile}
                    deleteIcon={<Clear />}
                    size="small"
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                />
                
                <IconButton 
                  color={selectedFile ? "info" : "default"} 
                  onClick={() => fileInputRef.current?.click()} 
                  aria-label="Attach file"
                >
                  <AttachFile />
                </IconButton>

                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder={selectedFile ? "Add a caption..." : `Message ${selectedConversation?.name || ''}...`} 
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
                  disabled={!draft.trim() && !selectedFile} 
                  aria-label="Send message"
                >
                  <Send />
                </IconButton>
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