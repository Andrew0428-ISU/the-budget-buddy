import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceInput = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fallbackActiveRef = useRef(false);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        ''
      ];
      let mimeType = '';
      for (const type of mimeCandidates) {
        // empty string means let the browser choose default
        if (!type || (window.MediaRecorder && MediaRecorder.isTypeSupported(type))) {
          mimeType = type;
          break;
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      fallbackActiveRef.current = true;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch {}

        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });

        try {
          const base64 = await blobToBase64(blob);
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { audio: base64 },
          });

          if (error) {
            console.error('Transcription error:', error);
            toast({
              title: 'Voice input error',
              description: 'Could not transcribe audio. Please try again.',
              variant: 'destructive',
            });
          } else {
            const text = (data as any)?.text as string | undefined;
            if (text && text.trim().length > 0) {
              onTranscript(text);
              toast({ title: 'Got it!', description: `Heard: "${text}"` });
            } else {
              toast({
                title: 'No speech detected',
                description: 'Please try again.',
                variant: 'destructive',
              });
            }
          }
        } catch (err) {
          console.error('Recording/transcription failure:', err);
          toast({
            title: 'Voice input error',
            description: 'Unexpected error while transcribing.',
            variant: 'destructive',
          });
        } finally {
          setIsListening(false);
          fallbackActiveRef.current = false;
          audioChunksRef.current = [];
        }
      };

      recorder.start();
      setIsListening(true);
      toast({ title: 'Listening...', description: 'Speak now into your microphone' });
    } catch (error) {
      console.error('Microphone permission/recording error:', error);
      toast({
        title: 'Microphone access needed',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (event.results[event.results.length - 1].isFinal) {
          onTranscript(transcript);
          toast({
            title: "Got it!",
            description: `Heard: "${transcript}"`,
          });
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Could not recognize speech. Please try again.";
        
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please speak clearly after clicking the microphone.";
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "No microphone found. Please check your microphone is connected.";
        } else if (event.error === 'network') {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        toast({
          title: "Voice input error",
          description: errorMessage,
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, toast]);

  const startListening = async () => {
    // If native speech recognition is available, use it
    if (recognitionRef.current) {
      // Check microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error('Microphone permission error:', error);
        toast({
          title: 'Microphone access needed',
          description: 'Please allow microphone access to use voice input.',
          variant: 'destructive',
        });
        return;
      }

      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({ title: 'Listening...', description: 'Speak now into your microphone' });
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (error instanceof Error && error.message.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
            }
          }, 100);
        } else {
          // Fallback to recorder + backend transcription
          await startRecording();
        }
      }
      return;
    }

    // Fallback path when SpeechRecognition API is not available
    await startRecording();
  };

  const stopListening = () => {
    if (fallbackActiveRef.current) {
      // Stop recording and let the onstop handler handle transcription
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, startListening, stopListening };
};
