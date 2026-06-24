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
  };
}

export const acsChatService = {
  getChatSession: async (payload: StartPoChatRequest): Promise<StartPoChatResponse> => {
    const response = await apiClient.post<StartPoChatResponse>('/chat/', payload);
    return response.data;
  }
};
