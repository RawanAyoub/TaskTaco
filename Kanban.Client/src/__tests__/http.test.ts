import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, API_BASE } from '@/services/http';

describe('http api()', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // @ts-expect-error override fetch for test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('sends requests to API_BASE and parses JSON', async () => {
    const mockJson = { ok: true };
    // @ts-expect-error fetch mock
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(mockJson))
    });

    const result = await api<{ ok: boolean }>('/ping');
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/ping`, expect.any(Object));
    expect(result.ok).toBe(true);
  });

  it('tolerates empty 200 response', async () => {
    // @ts-expect-error fetch mock
    global.fetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('') });
    const result = await api<void>('/empty');
    expect(result).toBeUndefined();
  });

  it('throws on non-ok responses with message', async () => {
    // @ts-expect-error fetch mock
    global.fetch.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve('boom') });
    await expect(api('/fail')).rejects.toThrow(/500/);
  });
});
