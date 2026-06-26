import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from 'react';
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
import { aiAssistantService } from '@/api/services/aiAssistantService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { acsChatService } from '@/api/services/acsChatService';
import { authService } from '@/api/services/authService';
import { CircularProgress } from '@mui/material';

export type ChatMessage = {
  id: string | number;
  sender: 'me' | 'other';
  text: string;
  time: string;
  fileName?: string;
  fileUrl?: string;   // Local or remote URL for preview/download
  fileType?: string;  // MIME type or category (e.g., 'image', 'document')
  read?: boolean;
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

export type ChatContext = {
  poNumber?: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
};

interface ChatWidgetProps {
  initialConversations: Conversation[];
  title?: string;
  subtitle?: string;
  chatContext?: ChatContext | null;
}

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getAcsSenderId = (message: any) =>
  message?.sender?.communicationUserId ||
  message?.sender?.rawId ||
  message?.sender?.id ||
  message?.senderCommunicationIdentifier?.communicationUserId ||
  message?.senderCommunicationIdentifier?.rawId ||
  message?.senderCommunicationIdentifier?.id ||
  message?.senderDisplayName ||
  '';

const isCurrentUserMessage = (message: any, currentUserAcsId: string, currentUserName?: string) => {
  const senderId = getAcsSenderId(message);
  return (
    senderId === currentUserAcsId ||
    senderId === currentUserName ||
    senderId.includes(currentUserAcsId) ||
    senderId.includes(currentUserName || '')
  );
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  initialConversations, 
  title = "Messages", 
  subtitle = "Chat with your team members",
  chatContext = null,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  const [open, setOpen] = useState(false);

  const AI_CONVERSATION: Conversation = {
    id: -999,
    name: 'AI Assistant',
    role: 'Procurement AI',
    avatar: 'AI',
    lastMessage: 'Ask me anything about purchase orders',
    lastTime: '',
    unread: 0,
    messages: []
  };

  const [conversations, setConversations] = useState<Conversation[]>([AI_CONVERSATION,...initialConversations]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [acsMessages, setAcsMessages] = useState<any[]>([]);
  const messageHandlerRef = useRef<any>(null);
  const seenAcsMessageIdsRef = useRef<Set<string>>(new Set());
  const [activeChatContext, setActiveChatContext] = useState<ChatContext | null>(chatContext);

  const [threadClient, setThreadClient] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isInitializingACS, setIsInitializingACS] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef(0);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll to the bottom whenever a new message lands or chat changes
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [conversations, open, selectedId]);

  useEffect(() => {
    setActiveChatContext(chatContext);
  }, [chatContext]);

  useEffect(() => {
    const handleChatContextEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ChatContext>;
      setActiveChatContext(customEvent.detail || null);
    };

    const clearChatContextEvent = (_event: Event) => {
      setActiveChatContext(null);
    };

    window.addEventListener('chat-context', handleChatContextEvent as EventListener);
    window.addEventListener('clear-chat-context', clearChatContextEvent);

    return () => {
      window.removeEventListener('chat-context', handleChatContextEvent as EventListener);
      window.removeEventListener('clear-chat-context', clearChatContextEvent);
    };
  }, []);

  useEffect(() => {
    if (activeChatContext) {
      const conversationId = hashString(activeChatContext.poNumber || 'po-chat');
      const poConversation: Conversation = {
        id: conversationId,
        name: activeChatContext.toName,
        role: 'PO-linked chat',
        avatar: activeChatContext.toName.slice(0, 2).toUpperCase(),
        lastMessage: `PO ${activeChatContext.poNumber || 'linked chat'}`,
        lastTime: '',
        unread: 0,
        messages: [],
        poNumber: activeChatContext.poNumber,
      };

      setConversations([AI_CONVERSATION, poConversation]);
      setSelectedId(conversationId);
      setAcsMessages([]);
      seenAcsMessageIdsRef.current = new Set();
      setThreadClient(null);
      messageHandlerRef.current = null;
      return;
    }

    const updatedConversations = [AI_CONVERSATION, ...initialConversations];

    if (updatedConversations.length > 0) {
      const firstId = updatedConversations[0].id;

      setSelectedId(firstId);
      setThreadClient(null);
      messageHandlerRef.current = null;
      setAcsMessages([]);
      seenAcsMessageIdsRef.current = new Set();
      setConversations(
        updatedConversations.map(c =>
          c.id === firstId
            ? { ...c, unread: 0 }
            : c
        )
      );
    }
  }, [initialConversations, activeChatContext]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) ?? conversations[0],
    [conversations, selectedId]
  );

    useEffect(() => {

      if (!threadClient || !open || selectedConversation?.id === -999) {
          return;
      }

      const unreadMessages = acsMessages.filter(
          msg =>
              msg.sender === "other" &&
              !msg.readReceiptSent
      );

      if (unreadMessages.length === 0) {
          return;
      }

      const sendReceipts = async () => {

          try {

              for (const msg of unreadMessages) {

                  await threadClient.sendReadReceipt({
                      chatMessageId: msg.id
                  });

              }

              setAcsMessages(prev =>
                  prev.map(msg =>
                      unreadMessages.some(
                          m => m.id === msg.id
                      )
                          ? {
                                ...msg,
                                readReceiptSent: true
                            }
                          : msg
                  )
              );

          } catch (err) {
              console.error(err);
          }

      };

      void sendReceipts();

  }, [
      threadClient,
      open,
      selectedConversation?.id,
      acsMessages
  ]);

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

  const handleSelectConversation =
    async (id: number) => {

      setSelectedId(id);

      setConversations(current =>
        current.map(c =>
          c.id === id
            ? { ...c, unread: 0 }
            : c
        )
      );

      if (id !== -999 && activeChatContext) {
        await initializeACS(activeChatContext);
      }
  };

  const typeWriterResponse = (
    text: string
  ) => {

    const messageId = Date.now();

    const botMessage: ChatMessage = {
      id: messageId,
      sender: 'other',
      text: '',
      time: formatTime(new Date())
    };

    setConversations(current =>
      current.map(conv =>
        conv.id === -999
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                botMessage
              ]
            }
          : conv
      )
    );

    let index = 0;

    const interval = setInterval(() => {

      index++;

      setConversations(current =>
        current.map(conv =>
          conv.id === -999
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        text: text.slice(
                          0,
                          index
                        )
                      }
                    : msg
                )
              }
            : conv
        )
      );

      if (index >= text.length) {
        clearInterval(interval);
      }

    }, 15);
  };

  const handleSend = async () => {

    if (isInitializingACS) {
        return;
    }

    const trimmed = draft.trim();

    if (
      selectedConversation?.id !== -999
    ) {
      if (!trimmed) {
        return;
      }

      if (!threadClient) {
        return;
      }

      await threadClient.sendMessage({
          content: trimmed
      });

      setDraft('');
      clearSelectedFile();

      return;
    }

    if (!trimmed && !selectedFile || !selectedConversation) return;

    let fileUrl = undefined;
    let fileType = undefined;

    if (selectedFile) {
      // Generate a temporary local browser link for previewing files
      fileUrl = URL.createObjectURL(selectedFile);
      fileType = selectedFile.type.startsWith('image/') ? 'image' : 'document';
    }

    const messageText = trimmed || (fileType === 'image' ? 'Sent an image' : `📄 Attached: ${selectedFile?.name}`);


    const question = trimmed;

    setDraft('');
    clearSelectedFile();

    if (selectedConversation?.id === -999) {

      setIsThinking(true);

      try {

        setConversations(current =>
          current.map(conv =>
            conv.id === -999
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages,
                    {
                      id: Date.now(),
                      sender: 'me',
                      text: question,
                      time: formatTime(new Date())
                    }
                  ]
                }
              : conv
          )
        );

        setTimeout(scrollToBottom, 0);

        const response = await aiAssistantService.askQuestion(question);

        setIsThinking(false);

        typeWriterResponse(
          response.output
        );

      } catch {

        setIsThinking(false);

        typeWriterResponse(
          'Sorry, I encountered an error.'
        );
      }

      return;
  }

    setDraft('');
    clearSelectedFile();
  };

  const initializeACS = async (context: ChatContext) => {
    setIsInitializingACS(true);
    try{
    const currentUser = authService.getCurrentUser();

    if (!currentUser?.email) {
      return;
    }

    const session = await acsChatService.getChatSession({
      fromEmail: currentUser.email,
      fromName: currentUser.name || currentUser.email,
      toEmail: context.toEmail,
      toName: context.toName,
      poNumber: context.poNumber,
    });

    const userId = session.data.acsUserId;
    seenAcsMessageIdsRef.current = new Set();

    const credential = new AzureCommunicationTokenCredential(session.data.token);
    const client = new ChatClient(session.data.endpoint, credential);
    const thread = client.getChatThreadClient(session.data.threadId);

    setThreadClient(thread);

    const history: Array<{
      id: string;
      text: string;
      sender: 'me' | 'other';
      time: string;
    }> = [];

    for await (const msg of thread.listMessages()) {
      const historyItem = {
        id: String(msg.id),
        text: msg.content?.message || '',
        sender: isCurrentUserMessage(msg, userId, currentUser.name) ? 'me' : 'other',
        time: msg.createdOn ? formatTime(new Date(msg.createdOn)) : '',
      };
      const text = msg.content?.message?.trim();

      if (!text) {
          continue;
      }

      if (!seenAcsMessageIdsRef.current.has(historyItem.id)) {
        seenAcsMessageIdsRef.current.add(historyItem.id);
        history.push(historyItem);
      }
    }

    setAcsMessages(history.reverse());

    await client.startRealtimeNotifications();

    if (!messageHandlerRef.current) {
      messageHandlerRef.current = async (event: any) => {
        if (event.threadId !== session.data.threadId) {
          return;
        }

        const isCurrentUser = isCurrentUserMessage(event, userId, currentUser.name);

        const messageId = String(event.id || `live-${Date.now()}`);

        if (seenAcsMessageIdsRef.current.has(messageId)) {
          return;
        }

        seenAcsMessageIdsRef.current.add(messageId);

        setAcsMessages(prev => [
          ...prev,
          {
            id: messageId,
            text: event.message,
            sender: isCurrentUser ? 'me' : 'other',
            ...(isCurrentUser
            ? { read: false }
            : { readReceiptSent: false }),
            time: event.createdOn ? formatTime(new Date(event.createdOn)) : formatTime(new Date()),
          },
        ]);

      };

      client.on("chatMessageReceived", messageHandlerRef.current);

      client.on(
        "typingIndicatorReceived",
        (event: any) => {

          if (
            event.threadId !== session.data.threadId
          ) {
            return;
          }

          if (
            isCurrentUserMessage(
              event,
              userId,
              currentUser.name
            )
          ) {
            return;
          }

          setIsOtherUserTyping(true);

          if (typingTimeoutRef.current) {
            clearTimeout(
              typingTimeoutRef.current
            );
          }

          typingTimeoutRef.current =
            setTimeout(() => {

              setIsOtherUserTyping(false);

            }, 3000);

        }
      );

      client.on(
        'readReceiptReceived',
        (event: any) => {

          console.log('Read Receipt', event);

          setAcsMessages(prev =>
            prev.map(msg =>
              msg.id === String(event.chatMessageId)
                ? {
                    ...msg,
                    read: true
                  }
                : msg
            )
          );

        }
      );
    }
      } finally {
    setIsInitializingACS(false);
  }
  };

  const sendTypingNotification = async () => {
    if (!threadClient) {
      return;
    }

    const now = Date.now();

    // Don't send too frequently
    if (now - lastTypingSentRef.current < 1000) {
      return;
    }

    lastTypingSentRef.current = now;

    try {
      await threadClient.sendTypingNotification();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!activeChatContext || selectedConversation?.id === -999 || threadClient) {
      return;
    }

    if (!open) {
      return;
    }

    void initializeACS(activeChatContext);
  }, [activeChatContext, open, selectedConversation?.id, threadClient]);

  useEffect(() => {

      return () => {

          if (typingTimeoutRef.current) {
              clearTimeout(
                  typingTimeoutRef.current
              );
          }

      };

  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [
    acsMessages,
    selectedConversation?.messages?.length,
    isThinking,
  ]);

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
              {isInitializingACS && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <CircularProgress />
                      <Typography variant="body2">
                        Loading chat...
                      </Typography>
                    </Box>
                  )}
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
            <Box ref={messagesContainerRef} sx={{ flexGrow: 1, px: 2, py: 2, overflowY: 'auto', backgroundColor: theme.palette.background.default }}>
              {
                (selectedConversation?.id === -999
                  ? selectedConversation?.messages
                  : acsMessages
                )?.map((message: any)  => (
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
                            <Download fontSize="small" />
                          </IconButton>
                        </Box>
                        {message.text && !message.text.startsWith('📄 Attached:') && (
                          <Typography variant="body2">{message.text}</Typography>
                        )}
                      </Box>
                    ) : (
                      // Plain Text Message Layout
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }: React.PropsWithChildren) => (
                            <Typography
                              variant="body2"
                              sx={{
                                m: 0,
                                lineHeight: 1.4
                              }}
                            >
                              {children}
                            </Typography>
                          )
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                    
                    <Box
                        sx={{
                            display:'flex',
                            justifyContent:'flex-end',
                            gap:0.5
                        }}
                      >

                      <Typography
                        variant="caption"
                      >

                      {message.time}

                      </Typography>

                      {
                      message.sender==="me" && (

                          <Typography
                            variant="caption"
                          >

                            {
                              message.read
                                ? "✓✓"
                                : "✓"
                            }

                          </Typography>

                      )

                      }

                      </Box>
                  </Paper>
                </Box>
              ))}
              {
                isThinking &&
                selectedConversation?.id === -999 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      mb: 1.2
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          alignItems: 'center',

                          '& .ai-dot': {
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#666',
                            animation: 'aiBounce 1.4s infinite ease-in-out'
                          },

                          '& .dot2': {
                            animationDelay: '0.2s'
                          },

                          '& .dot3': {
                            animationDelay: '0.4s'
                          },

                          '@keyframes aiBounce': {
                            '0%, 80%, 100%': {
                              transform: 'translateY(0)',
                              opacity: 0.4
                            },
                            '40%': {
                              transform: 'translateY(-6px)',
                              opacity: 1
                            }
                          }
                        }}
                      >
                        <Box className="ai-dot dot1" />
                        <Box className="ai-dot dot2" />
                        <Box className="ai-dot dot3" />
                      </Box>

                    </Paper>
                  </Box>
                )
              }
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

              {
                isOtherUserTyping && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 1,
                        minHeight: 32,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 22,
                            height: 22,
                            fontSize: 11,
                        }}
                    >
                        {selectedConversation?.name?.charAt(0)}
                    </Avatar>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            backgroundColor: "#F3F6FB",
                            px: 1.5,
                            py: 0.75,
                            borderRadius: "16px",
                        }}
                    >
                        {[0, 1, 2].map((i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                    animation: "typingAnimation 1.2s infinite ease-in-out",
                                    animationDelay: `${i * 0.2}s`,
                                    "@keyframes typingAnimation": {
                                        "0%, 80%, 100%": {
                                            opacity: 0.3,
                                            transform: "translateY(0px)",
                                        },
                                        "40%": {
                                            opacity: 1,
                                            transform: "translateY(-4px)",
                                        },
                                    },
                                }}
                            />
                        ))}
                    </Box>

                    <Typography
                        variant="caption"
                        sx={{
                            color: "text.secondary",
                            fontStyle: "italic",
                            userSelect: "none",
                        }}
                    >
                        {selectedConversation?.name} is typing...
                    </Typography>
                </Box>
                )
              }
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
                  onChange={(event) => {

                      setDraft(event.target.value);

                      if (selectedConversation?.id !== -999) {
                          sendTypingNotification();
                      }

                  }}
                  // disabled={isInitializingACS}
                  onKeyDown={(event) => {
                      if (isInitializingACS) {
                          event.preventDefault();
                          return;
                      }

                      if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                      }
                  }}
                />
                
                <IconButton 
                  color="primary" 
                  onClick={handleSend} 
                  disabled={
                      isInitializingACS ||
                      (!draft.trim() && !selectedFile)
                  }
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
