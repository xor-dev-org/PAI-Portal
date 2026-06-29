import apiClient from '../axios';

export interface ChatParticipantSummary {
  user_id: string;
  name?: string;
  role?: string;
}

export interface ChatSessionSummary {
  id: string;
  chat_type: string;
  po_id?: string | null;
  po_number?: string | null;
  participants: ChatParticipantSummary[];
  participants_signature?: string | null;
  created_by?: string | null;
  acs_thread_id?: string | null;
  acs_provider?: string | null;
  unread_count_by_user?: Record<string, number>;
  unread_count?: number;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
  last_message_at?: string | null;
  last_message_preview?: string;
}

export interface ChatSessionsResponse {
  page: number;
  page_size: number;
  total: number;
  data: ChatSessionSummary[];
}

export interface MarkChatSessionReadResponse {
  message: string;
  session: ChatSessionSummary;
  last_read_message_id?: string | null;
}

export const chatSessionService = {
  listSessions: async (): Promise<ChatSessionSummary[]> => {
    const response = await apiClient.get<ChatSessionsResponse>('/chat/sessions', {
      params: {
        page: 1,
        page_size: 100,
      },
    });

    return response.data.data || [];
  },

  markSessionRead: async (
    sessionId: string,
    lastReadMessageId?: string
  ): Promise<ChatSessionSummary> => {
    const response = await apiClient.post<MarkChatSessionReadResponse>(
      `/chat/sessions/${sessionId}/read`,
      {
        last_read_message_id: lastReadMessageId || null,
      }
    );

    return response.data.session;
  },
};
