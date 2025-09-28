import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Columns } from '@/services/columns';

const ok = (data: any) => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(data)) });

describe('Columns service', () => {
  const originalFetch = (globalThis as any).fetch;

  beforeEach(() => {
    ;(globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('byBoard calls correct endpoint', async () => {
    ;(globalThis as any).fetch.mockResolvedValue(ok([{ id: 1, name: 'To Do', boardId: 1, order: 0 }]));
    const res = await Columns.byBoard(1);
    expect(res[0].name).toBe('To Do');
    expect((globalThis as any).fetch).toHaveBeenCalledWith(expect.stringMatching(/\/column\/board\/1$/), expect.any(Object));
  });

  it('update uses PUT', async () => {
    ;(globalThis as any).fetch.mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve('') });
    await Columns.update(2, 'New Name', 1);
    const [,init] = (globalThis as any).fetch.mock.calls[0];
    expect(init.method).toBe('PUT');
  });
});
