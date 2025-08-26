import type { Track } from '../types';

export type MixMode = 'interleave' | 'shuffle' | 'concat';

export function mixPlaylists(playlists: Track[][], mode: MixMode = 'interleave'): Track[] {
  const filtered = playlists.filter(p => p && p.length);
  if (!filtered.length) return [];

  if (mode === 'concat') return filtered.flat();

  if (mode === 'shuffle') {
    const all = filtered.flat();
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  // interleave
  const maxLen = Math.max(...filtered.map(p => p.length));
  const out: Track[] = [];
  for (let i = 0; i < maxLen; i++) {
    for (const p of filtered) if (p[i]) out.push(p[i]);
  }
  return out;
}