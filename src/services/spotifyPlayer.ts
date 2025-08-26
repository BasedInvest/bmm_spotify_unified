export async function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already loaded and ready
    if (window.Spotify) {
      resolve();
      return;
    }

    // Spotify will call this when it's ready
  const onReady = 'onSpotifyWebPlaybackSDKReady' as const;
  (window as any)[onReady] = () =>
  window.Spotify ? resolve() : reject(new Error('Spotify SDK failed to initialize'));

    // Inject script if it’s not already in the DOM
    if (!document.querySelector(`script[src="https://sdk.scdn.co/spotify-player.js"]`)) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onerror = () => reject(new Error('Spotify SDK failed to load'));
      document.body.appendChild(script);
    }
  });
}