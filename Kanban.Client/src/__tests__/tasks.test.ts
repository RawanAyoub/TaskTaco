import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tasks } from '@/services/tasks';

const ok = (data: any) => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(data)) });

describe('Tasks service', () => {
  const originalFetch = (globalThis as any).fetch;

  beforeEach(() => {
    ;(globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('calls correct endpoint for byColumn', async () => {
    ;(globalThis as any).fetch.mockResolvedValue(ok([{ id: 1 }]));
    const res = await Tasks.byColumn(123);
    expect(res[0].id).toBe(1);
    expect((globalThis as any).fetch).toHaveBeenCalledWith(expect.stringMatching(/\/task\/column\/123$/), expect.any(Object));
  });

  it('create posts JSON', async () => {
    ;(globalThis as any).fetch.mockResolvedValue(ok({ id: 10 }));
    const res = await Tasks.create({ columnId: 1, title: 't', description: '', status: 'To Do', priority: 'Low' });
    expect(res.id).toBe(10);
    const [,init] = (globalThis as any).fetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toContain('"title":"t"');
  });
});
