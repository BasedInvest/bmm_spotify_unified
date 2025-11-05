import api from './api';
import type { BmmTrack } from '../types';

interface BmmApiItem {
  id: string | number;
  title?: string;
  name?: string;
  artist?: string;
  author?: string;
  url?: string;
  audioUrl?: string;
  image?: string;
  coverUrl?: string;
  durationMs?: number;
  duration?: number;
}

interface BmmApiResponse {
  items?: BmmApiItem[];
  tracks?: BmmApiItem[];
}

function safeString(value: unknown, defaultValue: string): string {
  return typeof value === 'string' && value.trim() ? value : defaultValue;
}

export async function fetchBmmCatalog(url?: string): Promise<BmmTrack[]> {
  // Use proxy pattern for BMM API calls
  // Common BMM endpoints: /discover, /podcast, /search?q=query
  const fetchUrl = url ?? '/api/bmm/discover';
  
  try {
    const { data } = await api.get<BmmApiResponse | BmmApiItem[]>(fetchUrl, { responseType: 'json' });
    
    // Accept multiple response shapes: an array, or an object with `items` or `tracks` arrays
    let items: BmmApiItem[];
    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data.items)) {
      items = data.items;
    } else if (Array.isArray(data.tracks)) {
      items = data.tracks;
    } else {
      // Unexpected shape; surface a helpful warning and return empty list
      // Caller (UI) should handle empty lists gracefully
      // Log the response to aid debugging
      // eslint-disable-next-line no-console
      console.warn('fetchBmmCatalog: unexpected response shape from', fetchUrl, data);
      return [];
    }

    // Map items to BmmTrack format with proper type safety
    return items
      .filter((t) => t && t.id) // Filter out invalid items
      .map((t) => ({
        id: String(t.id),
        title: safeString(t.title || t.name, 'Unknown Title'),
        artist: safeString(t.artist || t.author, 'Unknown Artist'),
        url: t.url || t.audioUrl || '',
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