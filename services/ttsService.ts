import { applyMeeBotInstructions } from './instructionService';

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
 * Speaks a given text using a voice appropriate for the detected language and mood,
 * respecting custom instructions from settings.
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

  // Get voice style preference from custom instructions in localStorage
  let voiceStyle: 'CalmFemale' | 'Default' = 'Default';
  try {
    const storedInstructions = window.localStorage.getItem('meebot-custom-instructions');
    if (storedInstructions) {
        voiceStyle = applyMeeBotInstructions(storedInstructions).voiceStyle;
    }
  } catch (e) {
      console.warn('Could not parse custom instructions for TTS.', e);
  }

  // Set base pitch and rate based on style
  if (voiceStyle === 'CalmFemale') {
      utterance.pitch = 0.9;
      utterance.rate = 0.9;
  } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
  }

  // Find a suitable voice for the detected language
  let availableVoices = voices.filter(v => v.lang.startsWith(lang));
  if (availableVoices.length === 0) {
      availableVoices = voices.filter(v => v.lang.startsWith('en'));
  }

  let selectedVoice: SpeechSynthesisVoice | undefined;

  // If "CalmFemale" is requested, try to find a voice that matches
  if (voiceStyle === 'CalmFemale') {
       selectedVoice = availableVoices.find(v => /female|zira|susan|kyoko/i.test(v.name));
  }

  // Fallback to the first available voice for the language if no specific voice is found
  if (!selectedVoice) {
      selectedVoice = availableVoices[0];
  }
  
  if (selectedVoice) {
      utterance.voice = selectedVoice;
  } else {
      console.warn(`No voice found for language: ${lang}. Using browser default.`);
  }

  // Modulate voice based on mood (multiplicatively, to combine with style)
  if (mood) {
    const lowerMood = mood.toLowerCase();
    if (lowerMood.includes('joy') || lowerMood.includes('excit')) {
      utterance.pitch *= 1.2;
      utterance.rate *= 1.1;
    } else if (lowerMood.includes('serene') || lowerMood.includes('calm') || lowerMood.includes('contemplative')) {
      utterance.pitch *= 0.9;
      utterance.rate *= 0.95;
    } else if (lowerMood.includes('stoic') || lowerMood.includes('guardian')) {
      utterance.pitch *= 0.8;
      utterance.rate *= 0.85;
    }
  }

  window.speechSynthesis.speak(utterance);
}