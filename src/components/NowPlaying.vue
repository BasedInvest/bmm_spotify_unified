<script setup lang="ts">
import type { BaseTrack } from '../types';

defineProps<{
  track: BaseTrack | null;
}>();
</script>

<template>
  <div v-if="track" class="now-playing">
    Now playing:
    <strong>{{ track.title }}</strong>
    — {{ track.artist }}
    <span v-if="track.source === 'spotify'">🎵</span>
    <span v-else>📂</span>
  </div>
  <div v-else class="now-playing empty">
    No track playing
  </div>
</template>

<style scoped>
.now-playing {
  margin-top: 20px;
  padding: 8px 10px;
  background: #f8f8f8;
  border-radius: 4px;
}
.now-playing.empty {
  color: #888;
  font-style: italic;
}
</style>