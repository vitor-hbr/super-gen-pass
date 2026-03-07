const CELL_FREQUENCIES = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33,
];

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext ||
    ((window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext as typeof AudioContext | undefined);

  if (!AudioContextCtor) {
    return null;
  }

  audioContext ??= new AudioContextCtor();
  return audioContext;
}

export async function playGridTone(cellIndex: number) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = CELL_FREQUENCIES[cellIndex] ?? 440;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  } catch {
    // Audio is optional; the grid still works without playback.
  }
}
