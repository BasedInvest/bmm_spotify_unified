# BMM Spotify Unified Player

A unified music player that combines content from both BMM (Brunstad Multimedia) and Spotify in a single interface.

## Features

- Play tracks from both BMM and Spotify
- Unified track list interface
- OAuth authentication for Spotify
- Proxy-based API calls to avoid CORS issues

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173
```

### Spotify Setup

1. Create a Spotify app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Add `http://localhost:5173` to the Redirect URIs in your app settings
3. Copy the Client ID to your `.env` file

### BMM API

The application uses the BMM API at `https://bmm-api.brunstad.org`. The proxy configuration in `vite.config.ts` handles CORS and forwards requests from `/api/bmm/*` to the BMM API.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## API Proxy Configuration

The Vite dev server is configured to proxy API requests:

- `/api/spotify/*` → `https://api.spotify.com/v1/*`
- `/api/bmm/*` → `https://bmm-api.brunstad.org/*`

This avoids CORS issues during development.

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Pinia (state management)
- Axios (HTTP client)
- Spotify Web Playback SDK
