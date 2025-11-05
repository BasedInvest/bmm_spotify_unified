import api from './api';
import type { BmmTrack } from '../types';

export async function fetchBmmCatalog(url?: string): Promise<BmmTrack[]> {
  // Use proxy pattern for BMM API calls
  // Common BMM endpoints: /discover, /podcast, /search?q=query
  const fetchUrl = url ?? '/api/bmm/discover';
  
  try {
    const { data } = await api.get(fetchUrl, { responseType: 'json' });
    
    // Accept multiple response shapes: an array, or an object with `items` or `tracks` arrays
    let items: any = data;
    if (!Array.isArray(items)) {
      if (Array.isArray(data.items)) items = data.items;
      else if (Array.isArray(data.tracks)) items = data.tracks;
      else {
        // Unexpected shape; surface a helpful warning and return empty list
        // Caller (UI) should handle empty lists gracefully
        // Log the response to aid debugging
        // eslint-disable-next-line no-console
        console.warn('fetchBmmCatalog: unexpected response shape from', fetchUrl, data);
        return [];
      }
    }

    // Expected item shape: { id, title, artist, url, image?, durationMs? }
    return items.map((t: any) => ({
      id: String(t.id),
      title: t.title || t.name || 'Unknown Title',
      artist: t.artist || t.author || 'Unknown Artist',
      url: t.url || t.audioUrl,
      image: t.image || t.coverUrl,
      durationMs: t.durationMs || t.duration,
      source: 'bmm'
    })) as BmmTrack[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fetchBmmCatalog: failed to fetch BMM catalog from', fetchUrl, error);
    return [];
  }
}