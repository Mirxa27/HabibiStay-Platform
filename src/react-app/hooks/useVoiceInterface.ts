import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceConfig, SpeechRecognitionResult } from '@/shared/types';

// Extend global types for better TypeScript support
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceInterfaceOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

interface VoiceInterfaceState {
  isSupported: boolean;
  isListening: boolean;
  isRecognitionAvailable: boolean;
  isSpeechSynthesisAvailable: boolean;
  currentTranscript: string;
  confidence: number;
  error: string | null;
}

export function useVoiceInterface({
  onResult,
  onError,
  language = 'en-US',
  continuous = false,
}: UseVoiceInterfaceOptions) {
  const [state, setState] = useState<VoiceInterfaceState>({
    isSupported: false,
    isListening: false,
    isRecognitionAvailable: false,
    isSpeechSynthesisAvailable: false,
    currentTranscript: '',
    confidence: 0,
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    const isRecognitionAvailable = !!SpeechRecognition;
    const isSpeechSynthesisAvailable = !!speechSynthesis;
    const isSupported = isRecognitionAvailable && isSpeechSynthesisAvailable;

    setState(prev => ({
      ...prev,
      isSupported,
      isRecognitionAvailable,
      isSpeechSynthesisAvailable,
    }));

    if (isRecognitionAvailable) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setState(prev => ({
              ...prev,
              currentTranscript: finalTranscript,
              confidence: confidence || 0,
            }));
          } else {
            interimTranscript += transcript;
            setState(prev => ({
              ...prev,
              currentTranscript: interimTranscript,
            }));
          }
        }

        if (finalTranscript && onResult) {
          onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }));
        
        if (onError) {
          onError(errorMessage);
        }
      };

      recognition.onend = () => {
        setState(prev => ({
          ...prev,
          isListening: false,
          currentTranscript: '',
        }));
      };

      recognitionRef.current = recognition;
    }

    if (isSpeechSynthesisAvailable) {
      synthRef.current = speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, onResult, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state.isListening) return;

    try {
      recognitionRef.current.start();
      
      // Auto-stop after 10 seconds of silence
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 10000);
    } catch (error) {
      const errorMessage = 'Failed to start speech recognition';
      setState(prev => ({ ...prev, error: errorMessage }));
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [state.isListening, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !state.isListening) return;

    recognitionRef.current.stop();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [state.isListening]);

  const speak = useCallback((
    text: string,
    config: Partial<VoiceConfig> = {}
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthRef.current) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice configuration
      utterance.rate = config.rate || 0.9;
      utterance.pitch = config.pitch || 1.1;
      utterance.volume = config.volume || 0.8;
      utterance.lang = config.language || language;

      // Set voice if specified
      if (config.voice) {
        const voices = synthRef.current.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name === config.voice || voice.name.includes(config.voice!)
        );
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      synthRef.current.speak(utterance);
    });
  }, [language]);

  const getAvailableVoices = useCallback(() => {
    if (!synthRef.current) return [];
    return synthRef.current.getVoices();
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    getAvailableVoices,
  };
}

// Higher-level hook for Sara's voice interface
export function useSaraVoice() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const voiceInterface = useVoiceInterface({
    onResult: () => {}, // Will be overridden by the component using this hook
    language: 'en-US',
    continuous: false,
  });

  const saraSpeak = useCallback(async (text: string) => {
    if (!isEnabled || !voiceInterface.isSpeechSynthesisAvailable) return;

    setIsSpeaking(true);
    try {
      await voiceInterface.speak(text, {
        rate: 0.9,
        pitch: 1.1,
        volume: 0.8,
        language: 'en-US',
      });
    } catch (error) {
      console.error('Sara speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [isEnabled, voiceInterface]);

  const toggleVoice = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (voiceInterface.isListening) {
      voiceInterface.stopListening();
    }
    if (isSpeaking) {
      voiceInterface.stopSpeaking();
      setIsSpeaking(false);
    }
  }, [voiceInterface, isSpeaking]);

  return {
    isEnabled,
    isSpeaking,
    isListening: voiceInterface.isListening,
    isSupported: voiceInterface.isSupported,
    error: voiceInterface.error,
    currentTranscript: voiceInterface.currentTranscript,
    confidence: voiceInterface.confidence,
    toggleVoice,
    startListening: voiceInterface.startListening,
    stopListening: voiceInterface.stopListening,
    speak: saraSpeak,
    stopSpeaking: voiceInterface.stopSpeaking,
  };
}