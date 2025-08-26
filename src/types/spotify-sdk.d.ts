interface Window {
  Spotify: typeof Spotify;
}

declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface Player {
    connect(): Promise<boolean>;
    addListener(event: string, cb: (...args: any[]) => void): void;
  }

  var Player: {
    new(init: PlayerInit): Player;
  };
}