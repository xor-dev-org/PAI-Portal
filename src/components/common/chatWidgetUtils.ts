import type { ChatContext, Conversation } from './ChatWidget';

export const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const createConversationFromContext = (
  context: ChatContext,
  existingConversation?: Conversation
): Conversation => ({
  id: hashString(context.poNumber || context.threadId || 'po-chat'),
  name: context.toName || 'Supplier Chat',
  role: 'PO-linked chat',
  avatar: (context.toName || 'SC').slice(0, 2).toUpperCase(),
  lastMessage: existingConversation?.lastMessage ?? 'Chat started',
  lastTime: '',
  unread: existingConversation?.unread ?? 0,
  messages: existingConversation?.messages ?? [],
  poNumber: context.poNumber,
  chatContext: context,
});

export const mergeConversations = (
  existingConversations: Conversation[],
  conversationsToAdd: Conversation[]
): Conversation[] => {
  const merged = [...existingConversations];

  conversationsToAdd.forEach((conversation) => {
    const existingIndex = merged.findIndex((item) => item.id === conversation.id);

    if (existingIndex === -1) {
      merged.push(conversation);
      return;
    }

    const existingConversation = merged[existingIndex]!;
    merged[existingIndex] = {
      ...existingConversation,
      ...conversation,
      messages: existingConversation.messages ?? conversation.messages ?? [],
      chatContext: conversation.chatContext ?? existingConversation.chatContext,
    };
  });

  return merged;
};
