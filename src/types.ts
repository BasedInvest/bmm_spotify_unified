export type Source = 'spotify' | 'bmm';

export interface BaseTrack {
  id: string;
  title: string;
  artist: string;
  url?: string; // BMM URL (optional on base)
  uri?: string; // Spotify URI (optional on base)
  durationMs?: number;
  image?: string;
  source: Source;
}

export interface SpotifyTrack extends BaseTrack {
  source: 'spotify';
  uri: string; // spotify:track:...
}

export interface BmmTrack extends BaseTrack {
  source: 'bmm';
  url: string; // https URL to MP3/stream
}

export type Track = SpotifyTrack | BmmTrack;

export interface Device {
  id: string;
  name?: string;
}

