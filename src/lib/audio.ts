// Audio clip playback for linked evidence (item 2). One shared player; playing
// a new clip stops the previous one. All expo-audio playback access lives here.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;
let currentUri: string | null = null;
let listeners: Array<(uri: string | null) => void> = [];

function notify(uri: string | null) {
  currentUri = uri;
  listeners.forEach((l) => l(uri));
}

/** Subscribe to "which clip is playing" for play/pause button state. */
export function onPlaybackChange(listener: (uri: string | null) => void): () => void {
  listeners.push(listener);
  listener(currentUri);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/** Play a recorded chunk file. Tapping the playing clip again stops it. */
export async function playClip(uri: string): Promise<void> {
  if (currentUri === uri) {
    stopClip();
    return;
  }
  stopClip();
  // Recording mode blocks speaker playback on iOS; switch out of it first.
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
  player = createAudioPlayer({ uri });
  player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) stopClip();
  });
  player.play();
  notify(uri);
}

export function stopClip(): void {
  if (player) {
    try {
      player.remove();
    } catch {
      // Already released — nothing to do.
    }
    player = null;
  }
  notify(null);
}
