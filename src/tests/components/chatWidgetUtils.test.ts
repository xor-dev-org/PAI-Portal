import { describe, expect, it } from 'vitest';
import { createConversationFromContext, mergeConversations } from '@/components/common/chatWidgetUtils';

describe('chatWidgetUtils', () => {
  it('adds supplier linked conversations without duplicating existing ones', () => {
    const existingConversation = {
      id: 123,
      name: 'Supplier A',
      role: 'PO-linked chat',
      avatar: 'SA',
      lastMessage: 'PO PO-10001',
      lastTime: '',
      unread: 0,
      messages: [],
      poNumber: 'PO-10001',
      chatContext: {
        poNumber: 'PO-10001',
        fromEmail: 'buyer@example.com',
        fromName: 'Buyer',
        toEmail: 'supplier@example.com',
        toName: 'Supplier A',
      },
    };

    const context = {
      poNumber: 'PO-10002',
      fromEmail: 'buyer@example.com',
      fromName: 'Buyer',
      toEmail: 'supplier-b@example.com',
      toName: 'Supplier B',
    };

    const merged = mergeConversations([existingConversation], [createConversationFromContext(context)]);

    expect(merged).toHaveLength(2);
    expect(merged.find((conversation) => conversation.poNumber === 'PO-10002')).toBeDefined();
    expect(merged.find((conversation) => conversation.poNumber === 'PO-10001')).toEqual(existingConversation);
  });
});
