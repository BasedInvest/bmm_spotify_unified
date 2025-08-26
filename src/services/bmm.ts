import api, { bmmUrl } from './api';
import type { BmmTrack } from '../types';

export async function fetchBmmCatalog(url?: string): Promise<BmmTrack[]> {
  // Default to BMM base + /catalog if no url provided
  const fetchUrl = url ?? bmmUrl('/catalog');
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
      console.warn('fetchBmmCatalog: unexpected response shape from', url, data);
      return [];
    }
  }

  // Expected item shape: { id, title, artist, url, image?, durationMs? }
  return items.map((t: any) => ({
    id: String(t.id),
    title: t.title,
    artist: t.artist,
    url: t.url,
    image: t.image,
    durationMs: t.durationMs,
    source: 'bmm'
  })) as BmmTrack[];
}