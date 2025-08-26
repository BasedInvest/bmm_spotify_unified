<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { usePlayerStore } from '../store/player';
import { createAuthUrl, handleCallback, getAccessToken, initPlayer, playSpotifyTrack } from '../services/spotify';
import { fetchBmmCatalog } from '../services/bmm';
import { loadSpotifySDK } from '../services/spotifyPlayer'
import type { BaseTrack, SpotifyTrack, BmmTrack } from '../types';

const store = usePlayerStore();

const bmmTracks = ref<BmmTrack[]>([]);
const spotifyTracks = ref<SpotifyTrack[]>([]); // later: fetch playlists/tracks from Spotify API
const audio = new Audio(); // for BMM playback

// Merge BMM + Spotify into one list
const unified = computed<BaseTrack[]>(() => {
  return [...spotifyTracks.value, ...bmmTracks.value];
});

const currentTrack = ref<BaseTrack | null>(null);

// Navigate to Spotify auth URL
async function navigateToAuth() {
  const url = await createAuthUrl();
  window.location.href = url;
}

// Handle playback
async function playTrack(track: BaseTrack) {
  currentTrack.value = track;

  if (track.source === 'spotify') {
    if (!store.accessToken) {
      console.error('No Spotify token, cannot play track');
      return;
    }
    if (!store.deviceId) {
      console.error('No Spotify device id; player not ready');
      return;
    }
    await playSpotifyTrack(store.accessToken, store.deviceId, track.uri ?? '');
    } else {
      if (!track.url) {
        console.error('BMM track missing URL');
        return;
      }
      audio.src = track.url;
      await audio.play();
    }
}
  

// Initial setup
onMounted(async () => {
  // Handle OAuth callback if redirected from Spotify login
  if (window.location.search.includes('code=')) {
    const token = await handleCallback();
    if (token) {
      store.setToken(token);
      await loadSpotifySDK(); // Load Spotify SDK after getting token
      await initPlayer(store.accessToken, (deviceId: string) => {
        store.setDevice(deviceId);
        store.setReady(true);
      });
    }
  } else {
    // If token already stored, pick it up and init player
    const existing = await getAccessToken();
    if (existing) {
      store.setToken(existing);
      await loadSpotifySDK();
      await initPlayer(store.accessToken, (deviceId: string) => {
        store.setDevice(deviceId);
        store.setReady(true);
      });
    }
  }

  // Load BMM catalog
  bmmTracks.value = await fetchBmmCatalog();

  // For now, add a few demo Spotify tracks (replace with API fetch later)
  spotifyTracks.value = [
    { id: '1', title: 'Test Spotify Song', artist: 'Unknown', source: 'spotify', uri: 'spotify:track:xyz' }
  ];
});
</script>

<template>
  <div class="player">
    <h2>Unified Player</h2>

  <!-- Spotify login if not authenticated -->
  <button v-if="!store.accessToken" @click="navigateToAuth">Login with Spotify</button>

    <!-- Track list -->
    <ul>
      <li
        v-for="track in unified"
        :key="track.id"
        @click="playTrack(track)"
        style="cursor:pointer"
      >
        {{ track.title }} — {{ track.artist }}
        <span v-if="track.source === 'spotify'">🎵</span>
        <span v-else>📂</span>
      </li>
    </ul>

    <!-- Now playing -->
    <div v-if="currentTrack" class="now-playing">
      Now playing: {{ currentTrack.title }} — {{ currentTrack.artist }}
    </div>
  </div>
</template>

<style scoped>
.player {
  max-width: 600px;
  margin: auto;
}
ul {
  list-style: none;
  padding: 0;
}
li:hover {
  background: #eee;
}
.now-playing {
  margin-top: 20px;
  font-weight: bold;
}
</style>