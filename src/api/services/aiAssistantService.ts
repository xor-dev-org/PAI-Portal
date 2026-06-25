import apiClient from '../axios';
import { AIChatResponse } from '@/models';

export const aiAssistantService = {
  askQuestion: async (
    query: string
  ): Promise<AIChatResponse> => {

    const response = await apiClient.post<AIChatResponse>(
      '/ai/sql-query',
      {
        query
      }
    );

    return response.data;
  }
};