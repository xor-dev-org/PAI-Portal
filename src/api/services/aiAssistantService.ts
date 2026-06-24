import apiClient from '../axios';
import { AIChatResponse } from '@/models';

export const aiAssistantService = {
  askQuestion: async (
    question: string
  ): Promise<AIChatResponse> => {

    const response = await apiClient.post<AIChatResponse>(
      '/query-chat/ask',
      {
        question
      }
    );

    return response.data;
  }
};