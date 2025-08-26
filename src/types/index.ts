export type TrackSource = 'spotify' | 'bmm';

export interface BaseTrack {
  id: string;
  title: string;
  artist: string;
  source: TrackSource;
  uri?: string; // Spotify URI
  url?: string; // BMM URL
}

export interface SpotifyTrack extends BaseTrack {
  source: 'spotify';
  uri: string;
}

export interface BmmTrack extends BaseTrack {
  source: 'bmm';
  url: string;
}