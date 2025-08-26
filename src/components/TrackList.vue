<script setup lang="ts">
import type { BaseTrack } from '../types';

defineProps<{
  tracks: BaseTrack[];
  currentTrackId: string | null;
}>();

defineEmits<{
  (e: 'play', track: BaseTrack): void;
}>();
</script>

<template>
  <ul class="track-list">
    <li
      v-for="track in tracks"
      :key="track.id"
      @click="$emit('play', track)"
      :class="{ active: currentTrackId === track.id }"
    >
      {{ track.title }} — {{ track.artist }}
      <span v-if="track.source === 'spotify'">🎵</span>
      <span v-else>📂</span>
    </li>
  </ul>
</template>

<style scoped>
.track-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.track-list li {
  padding: 6px 10px;
  cursor: pointer;
}
.track-list li:hover {
  background: #eee;
}
.track-list li.active {
  background: #d1e7ff;
  font-weight: bold;
}
</style>