import api from './api';
import type { SpotifyTrack } from '../types';

function getClientId(): string {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
}

function getRedirectUri(): string {
  return import.meta.env.VITE_REDIRECT_URI as string;
}

function requireClientId(): string {
  const id = getClientId();
  if (!id) throw new Error('Missing VITE_SPOTIFY_CLIENT_ID environment variable. Set it in unified-player/.env and restart the dev server.');
  return id;
}

function requireRedirectUri(): string {
  const uri = getRedirectUri();
  if (!uri) throw new Error('Missing VITE_REDIRECT_URI environment variable. Make sure it exactly matches the Redirect URI registered in your Spotify dashboard.');
  return uri;
}

const Scopes = [
  'playlist-read-private',
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state'
];


export async function getUserPlaylists(limit = 50) {
  const {data} = await api.get('/api/spotify/me/playlists', { params: { limit } });
  return data as {items: Array<{ id: string; name: string; images: Array<{ url: string }> }> };
}
// Fetch all tracks from a Spotify playlist via backend proxy
export async function getPlaylistTracksAll(playlistId: string): Promise<SpotifyTrack[]> {
  const mapItem = (it: any): SpotifyTrack | null => {
    const t = it?.track;
    if (!t?.id || !t?.uri) return null;
    return {
      id: t.id,
      title: t.name,
      artist: (t.artists || []).map((a: any) => a.name).join(', '),
      image: t.album?.images?.[0]?.url,
      durationMs: t.duration_ms,
      source: 'spotify',
      uri: t.uri,
    };
  };

  let url = `/api/spotify/playlists/${playlistId}/tracks`;
  const tracks: SpotifyTrack[] = [];
  for (;;) {
    const { data } = await api.get(url);
    for (const it of data.items || []) {
      const mapped = mapItem(it);
      if (mapped) tracks.push(mapped);
    }
    if (!data.next) break;
    const next = new URL(data.next);
    const offset = next.searchParams.get('offset');
    const limit = next.searchParams.get('limit');
    url = `/api/spotify/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`;
  }
  return tracks;
}

function base64UrlEncode(str: ArrayBuffer) {
  const bytes = new Uint8Array(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

export async function createAuthUrl() {
  const codeVerifier = Array.from(crypto.getRandomValues(new Uint32Array(28)))
    .map(n => n.toString(36)).join('').slice(0, 128);
  localStorage.setItem('sp_code_verifier', codeVerifier);
  const codeChallenge = await sha256(codeVerifier);
  const params = new URLSearchParams({
    response_type: 'code',
  client_id: requireClientId(),
    scope: Scopes.join(' '),
  redirect_uri: requireRedirectUri(),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleCallback(): Promise<string | null> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) return null;
  const codeVerifier = localStorage.getItem('sp_code_verifier')!;
  const body = new URLSearchParams({
  client_id: requireClientId(),
    grant_type: 'authorization_code',
    code,
  redirect_uri: requireRedirectUri(),
    code_verifier: codeVerifier
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error('Token exchange failed');
  const json = await res.json();
  const accessToken = json.access_token as string;
  const refreshToken = json.refresh_token as string | undefined;
  const expiresIn = json.expires_in as number | undefined;

  // Persist tokens and expiry
  if (accessToken) localStorage.setItem('sp_access_token', accessToken);
  if (refreshToken) localStorage.setItem('sp_refresh_token', refreshToken);
  if (expiresIn) localStorage.setItem('sp_expires_at', String(Date.now() + expiresIn * 1000));
  // Clean the URL
  const clean = new URL(window.location.href);
  clean.searchParams.delete('code');
  history.replaceState({}, '', clean.toString());
  return accessToken;
}

export async function getAccessToken(): Promise<string | null> {
  const stored = localStorage.getItem('sp_access_token');
  return stored ?? null;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  // Local refresh: POST to Spotify token endpoint using client_id + refresh_token
  const params = new URLSearchParams();
  params.append('client_id', requireClientId());
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    const body = text || res.statusText;
    console.error('Spotify refresh failed', res.status, body);
    throw new Error(`Refresh token failed: ${res.status} ${body}`);
  }

  const json = text ? JSON.parse(text) : {};
  const newAccess = json.access_token as string;
  const newRefresh = json.refresh_token as string | undefined;
  const expiresIn = json.expires_in as number | undefined;

  if (newAccess) localStorage.setItem('sp_access_token', newAccess);
  if (newRefresh) localStorage.setItem('sp_refresh_token', newRefresh);
  // compute expiry from expires_in; don't hardcode 3 hours
  if (typeof expiresIn === 'number') {
    localStorage.setItem('sp_expires_at', String(Date.now() + expiresIn * 1000));
  }

  return newAccess;
}

export async function ensureAccessToken(): Promise<string | null> {
  const token = localStorage.getItem('sp_access_token');
  const expiresAt = Number(localStorage.getItem('sp_expires_at') || '0');
  if (token && expiresAt && Date.now() < expiresAt - 5000) return token;
  const refresh = localStorage.getItem('sp_refresh_token');
  if (refresh) {
    try {
      const newToken = await refreshAccessToken(refresh);
      return newToken;
    } catch (e) {
      console.error('Failed to refresh token', e);
      return null;
    }
  }
  return token ?? null;
}

export async function loadSpotifySDK(): Promise<void> {
  if ((window as any).Spotify) return; // already loaded
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = ' https://sdk.scdn.co';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Spotify SDK'));
    document.body.appendChild(script);
  });
}

export async function initPlayer(token: string | null, onReady: (deviceId: string) => void) {
  const t = token ?? await ensureAccessToken();
  if (!t) throw new Error('No Spotify access token available for player initialization');
  await loadSpotifySDK();
  await new Promise<void>((resolve) => {
    (window as any).onSpotifyWebPlaybackSDKReady = () => resolve();
    if ((window as any).Spotify) resolve();
  });
  const player = new (window as any).Spotify.Player({
    name: 'Unified Player',
  getOAuthToken: (cb: (t: string) => void) => cb(t),
    volume: 0.8,
  });

  player.addListener('ready', ({ device_id }: any) => onReady(device_id));
  player.addListener('initialization_error', ({ message }: any) => console.error(message));
  player.addListener('authentication_error', ({ message }: any) => console.error(message));
  player.addListener('account_error', ({ message }: any) => console.error(message));
  player.addListener('playback_error', ({ message }: any) => console.error(message));

  await player.connect();
  return player as Spotify.Player;
}

export async function playSpotifyTrack(token: string | null, deviceId: string, uri: string) {
  const t = token ?? await ensureAccessToken();
  if (!t) throw new Error('No access token');
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: [uri] })
  });
  if (!res.ok) throw new Error('Failed to start playback');
}