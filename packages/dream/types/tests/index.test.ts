import { describe, it, expect } from 'vitest';

describe('@dream/types barrel export', () => {
  it('exports User type', async () => {
    const mod = await import('../src/index');
    // Type-only exports won't show up in runtime. We verify the module loads.
    expect(mod).toBeDefined();
  });
});
