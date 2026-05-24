import { describe, it, expect } from 'vitest';
import apiClient from '@/api/axios';

describe('axios client', () => {
  it('should create axios instance', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('/api');
  });

  it('should have default timeout', () => {
    expect(apiClient.defaults.timeout).toBe(10000);
  });
});
