let voices: SpeechSynthesisVoice[] = [];

// Populates the voices array when they are loaded.
const populateVoiceList = () => {
  if (typeof speechSynthesis === 'undefined') {
    return;
  }
  voices = speechSynthesis.getVoices();
};

populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

/**
 * A simple language detector based on character sets.
 * @param text The text to analyze.
 * @returns A two-letter language code (e.g., 'th', 'ja', 'en').
 */
function detectLanguage(text: string): string {
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  // Japanese
  if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(text)) return 'ja';
  // Default to English
  return 'en';
}

/**
 * Speaks a given text using a voice appropriate for the detected language and mood.
 * @param text The text to be spoken.
 * @param mood An optional mood string to modulate the voice.
 */
export function speak(text: string, mood?: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech Synthesis not supported in this browser.');
    return;
  }
  
  // Cancel any speech that is currently in progress.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = detectLanguage(text);

  // Find a suitable voice. Prioritize the detected language, then fall back to English.
  let selectedVoice = voices.find(v => v.lang.startsWith(lang)) || voices.find(v => v.lang.startsWith('en'));
  
  if (selectedVoice) {
      utterance.voice = selectedVoice;
  } else {
      console.warn(`No voice found for language: ${lang}. Using browser default.`);
  }
  
  // Default pitch and rate
  utterance.pitch = 1.0;
  utterance.rate = 1.0;

  // Modulate voice based on mood
  if (mood) {
    const lowerMood = mood.toLowerCase();
    if (lowerMood.includes('joy') || lowerMood.includes('excit')) {
      utterance.pitch = 1.2;
      utterance.rate = 1.1;
    } else if (lowerMood.includes('serene') || lowerMood.includes('calm') || lowerMood.includes('contemplative')) {
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
    } else if (lowerMood.includes('stoic') || lowerMood.includes('guardian')) {
      utterance.pitch = 0.7;
      utterance.rate = 0.8;
    }
  }

  window.speechSynthesis.speak(utterance);
}
