import apiClient from '../axios';

export interface StartPoChatRequest {
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  poNumber?: string;
}

export interface StartPoChatResponse {
  status: string;
  created: boolean;
  data: {
    threadId: string;
    token: string;
    acsUserId: string;
    endpoint: string;
    poNumber?: string;
    participants: string[];
    lastReadMessageId?: string | null;
  };
}

export interface BootstrapChatItem {
  threadId: string;
  token: string;
  acsUserId: string;
  endpoint: string;
  poNumber?: string;
  participants: string[];
  currentParticipant?: {
    email?: string;
    name?: string;
    acsUserId?: string;
  };
  counterpart?: {
    email?: string;
    name?: string;
    acsUserId?: string;
  };
  lastReadMessageId?: string | null;
}

export interface MarkAcsChatReadRequest {
  email: string;
  threadId: string;
  lastReadMessageId: string;
}

export interface MarkAcsChatReadResponse {
  status: string;
  message: string;
  data: {
    threadId: string;
    email: string;
    lastReadMessageId: string;
  };
}

export interface BootstrapChatsResponse {
  status: string;
  data: BootstrapChatItem[];
}

export const acsChatService = {
  getChatSession: async (payload: StartPoChatRequest): Promise<StartPoChatResponse> => {
    const response = await apiClient.post<StartPoChatResponse>('/chat/', payload);
    return response.data;
  },

  bootstrapChats: async (email: string): Promise<BootstrapChatItem[]> => {
    const response = await apiClient.get<BootstrapChatsResponse>('/chat/bootstrap', {
      params: { email },
    });

    return response.data.data || [];
  },

  markChatRead: async (payload: MarkAcsChatReadRequest): Promise<MarkAcsChatReadResponse> => {
    const response = await apiClient.post<MarkAcsChatReadResponse>('/chat/read', {
      email: payload.email,
      thread_id: payload.threadId,
      last_read_message_id: payload.lastReadMessageId,
    });

    return response.data;
  }
};
