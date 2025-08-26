import { defineStore } from 'pinia';
import type { BaseTrack, Source } from '../types';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    spotifyTrack : null as BaseTrack | null,
    deviceId: '' as string,
    isReady: false,
    current: null as BaseTrack | null,
    queue: [] as BaseTrack[],
    source: null as Source | null,
    isPlaying: false,
    positionMs: 0,
    volume: 0.8,
    accessToken: '' as string, // Spotify token
  }),
  actions: {
    setToken(token: string) { this.accessToken = token; },
    setDevice(id: string) { this.deviceId = id; },
    setReady(ready: boolean) { this.isReady = ready; },
    setQueue(tracks: BaseTrack[]) { this.queue = tracks; },
    play(track: BaseTrack) {
      this.current = track;
      this.source = track.source;
      this.isPlaying = true;
    },
    pause() { this.isPlaying = false; },
    resume() { this.isPlaying = true; },
  }
});