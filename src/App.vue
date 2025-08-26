<script setup lang="ts">
import UnifiedPlayer from './components/UnifiedPlayer.vue'
</script>

<template>
    <header class="app-header">
    <a href ="https://bmm.bcc.media/" target="_blank" rel="noopener" >
    <img src="./assets/bmm.png" alt="bmm" class="logo vue" />
    </a>

    <div class="center-x">❎</div>

    <a href="https://spotify.com" target="_blank" rel="noopener">
      <img src="./assets/spotify.png" alt="spotify logo" class="logo vue" />
    </a>

  </header>
  <main class="min-h-screen p-6 font-sans">
    <h1>BMM_spotify_unified</h1>
    <UnifiedPlayer />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;               /* enable flex layout */
  flex-direction: row;         /* make children horizontal */
  align-items: center;         /* vertically center them */
  justify-content: space-between; /* spread left, center, right */
}

.logo {
  height: 40px;
  cursor: pointer;
}

</style>

<style scoped>
main { max-width: 960px; margin: 0 auto; }
h1 { font-size: 1.8rem; margin-bottom: 1rem; }
</style>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
