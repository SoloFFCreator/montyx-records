import { describe, expect, it } from 'vitest';
import { resolveTuiLayoutPolicy } from '../../../../src/tui/shell/layout-policy.js';

describe('resolveTuiLayoutPolicy', () => {
  it('uses compact density for common phone terminal widths', () => {
    expect(resolveTuiLayoutPolicy(55, 24)).toMatchObject({
      density: 'compact',
      welcome: 'compact',
      horizontalPadding: 0,
      transcriptOverscanRows: 4,
    });
  });

  it('uses compact density for short phone viewports even when width is generous', () => {
    expect(resolveTuiLayoutPolicy(80, 15)).toMatchObject({
      density: 'compact',
      welcome: 'compact',
      horizontalPadding: 0,
    });
  });

  it('preserves standard and wide layouts above the phone breakpoints', () => {
    expect(resolveTuiLayoutPolicy(56, 16).density).toBe('standard');
    expect(resolveTuiLayoutPolicy(72, 24).density).toBe('wide');
  });
});
