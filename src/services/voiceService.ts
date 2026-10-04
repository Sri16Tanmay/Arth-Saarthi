import { Language } from '../types';
import { getLanguageConfig } from '../i18n';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'responding' | 'error';

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export class VoiceController {
  private recognition: any = null;
  private isSupported: boolean = false;
  private currentLanguage: Language = 'en';

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.recognition) {
      const config = getLanguageConfig(lang);
      this.recognition.lang = config.speechLocale || 'en-IN';
    }
  }

  public startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onStateChange: (state: VoiceState) => void,
    onError: (errMessage: string) => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError("Voice isn't available for this language on this device. You can type instead.");
      onStateChange('error');
      return;
    }

    this.setLanguage(this.currentLanguage);

    this.recognition.onstart = () => {
      onStateChange('listening');
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult({
        transcript: finalTranscript || interimTranscript,
        isFinal: Boolean(finalTranscript),
      });
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onError('Microphone permission was denied. Please allow microphone access to use voice.');
      } else if (event.error === 'no-speech') {
        onError('No speech was detected. Please try speaking again.');
      } else if (event.error === 'language-not-supported') {
        onError("Voice recognition isn't supported for this language on this device. You can type instead.");
      } else {
        onError("Voice recognition isn't available for this language on this device. You can type instead.");
      }
      onStateChange('error');
      this.stopListening();
    };

    this.recognition.onend = () => {
      onStateChange('idle');
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      this.stopListening();
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public speak(
    text: string,
    language: Language,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/###\s+/g, '')
      .replace(/[*_#`]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const config = getLanguageConfig(language);
    utterance.lang = config.speechLocale || 'en-IN';

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceController = new VoiceController();
