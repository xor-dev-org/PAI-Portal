import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });

    // Should still be initial immediately after change
    expect(result.current).toBe('initial');

    // Should update after delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 600 }
    );
  });

  it('should handle multiple rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      {
        initialProps: { value: 'v1' },
      }
    );

    rerender({ value: 'v2' });
    rerender({ value: 'v3' });
    rerender({ value: 'v4' });

    // Should still show initial value
    expect(result.current).toBe('v1');

    // Should only update to the last value after delay
    await waitFor(
      () => {
        expect(result.current).toBe('v4');
      },
      { timeout: 400 }
    );
  });
});
