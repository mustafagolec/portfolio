// Sound effect URLs and their volume levels
const SOUND_EFFECTS = {
  click: { url: '/portfolio/sounds/pip-boy-click.mp3', volume: 0.5 },
  select: { url: '/portfolio/sounds/pip-boy-select.mp3', volume: 0.15 }, // Lower volume for select sound
  close: { url: '/portfolio/sounds/pip-boy-close.mp3', volume: 0.5 }
} as const;

// Type for sound effect keys
type SoundEffectKey = keyof typeof SOUND_EFFECTS;

// Audio context for better performance
let audioContext: AudioContext | null = null;
let audioBuffers: { [K in SoundEffectKey]?: AudioBuffer } = {};
let isMuted = false;
let isInitialized = false;

// Initialize audio context and load sounds
const initializeAudio = async () => {
  if (isInitialized) return;

  try {
    // Create audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume audio context if it was suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Load all sound effects
    await Promise.all(
      Object.entries(SOUND_EFFECTS).map(async ([key, { url }]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext!.decodeAudioData(arrayBuffer);
          audioBuffers[key as SoundEffectKey] = audioBuffer;
        } catch (error) {
          console.warn(`Failed to load sound effect ${key}:`, error);
        }
      })
    );

    isInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
};

// Play a sound effect
const playSound = async (type: SoundEffectKey) => {
  if (isMuted || !audioContext || !audioBuffers[type]) {
    return;
  }

  try {
    // Resume audio context if it was suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    // Set individual volume for this sound
    gainNode.gain.value = SOUND_EFFECTS[type].volume;
    
    source.buffer = audioBuffers[type]!;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
};

// Toggle audio mute state
const toggleMute = () => {
  isMuted = !isMuted;
  return isMuted;
};

// Get current mute state
const getMuteState = () => isMuted;

// Get initialization state
const getInitializationState = () => isInitialized;

export { initializeAudio, playSound, toggleMute, getMuteState, getInitializationState }; 