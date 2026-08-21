import { WEBVIEW_STATE_VERSION } from '@constants';
import { describe, expect, it } from 'vitest';

import { migrateState, normalizeResults, parseSettings } from './state-migration';

describe('state migration', () => {
  it('migrates v1 results by backfilling displayPath', () => {
    const migrated = migrateState({
      __stateVersion: 1,
      results: [
        {
          fileName: 'foo.ts',
          relativePath: 'src/foo.ts',
          fullPath: '/workspace/src/foo.ts',
        },
      ],
    });

    expect(migrated.__stateVersion).toBe(WEBVIEW_STATE_VERSION);
    expect(migrated.results).toHaveLength(1);
    expect(migrated.results?.[0].displayPath).toBe('/workspace/src/foo.ts');
  });

  it('keeps latest state shape intact', () => {
    const migrated = migrateState({
      __stateVersion: WEBVIEW_STATE_VERSION,
      query: 'abc',
      results: [
        {
          fileName: 'bar.ts',
          relativePath: 'src/bar.ts',
          fullPath: '/workspace/src/bar.ts',
          displayPath: 'src/bar.ts',
        },
      ],
    });

    expect(migrated.__stateVersion).toBe(WEBVIEW_STATE_VERSION);
    expect(migrated.query).toBe('abc');
    expect(migrated.results?.[0].displayPath).toBe('src/bar.ts');
  });

  it('sanitizes invalid result payloads', () => {
    const normalized = normalizeResults([
      {
        fileName: 'ok.ts',
        relativePath: 'ok.ts',
        fullPath: '/workspace/ok.ts',
      },
      {
        fileName: 'bad.ts',
      },
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].displayPath).toBe('/workspace/ok.ts');
  });

  it('validates settings payload shape', () => {
    expect(parseSettings({ maxResults: 100, historyLimit: 20, debounceDelay: 120 })).toEqual({
      maxResults: 100,
      historyLimit: 20,
      debounceDelay: 120,
    });

    expect(parseSettings({ maxResults: 100, historyLimit: '20', debounceDelay: 120 })).toBeNull();
  });
});
