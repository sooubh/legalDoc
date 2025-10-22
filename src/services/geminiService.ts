import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// Base64 encoding/decoding functions
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio decoding function
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// PCM Blob creation
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export interface LiveSessionCallbacks {
  onOpen: () => void;
  onMessage: (message: LiveServerMessage) => Promise<void>;
  onError: (e: ErrorEvent) => void;
  onClose: (e: CloseEvent) => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  public inputAudioContext: AudioContext | null = null;
  public outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

  public nextStartTime = 0;
  private outputAudioSources = new Set<AudioBufferSourceNode>();

  constructor() {
    // Use import.meta.env for Vite projects
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please add it to your .env file.");
    }
    
    console.log("[GeminiLiveService] Initializing with API key:", apiKey.substring(0, 10) + "...");
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async startSession(systemInstruction: string, callbacks: LiveSessionCallbacks) {
    console.log("[GeminiLiveService] Starting session with system instruction");
    
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.nextStartTime = 0;

    console.log("[GeminiLiveService] Audio contexts created");

    const sessionPromise = this.ai.live.connect({
      model: 'gemini-2.0-flash-exp',
      callbacks: {
        onopen: callbacks.onOpen,
        onmessage: callbacks.onMessage,
        onerror: callbacks.onError,
        onclose: callbacks.onClose,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
      },
    });

    console.log("[GeminiLiveService] Connecting to Gemini Live API...");

    try {
      console.log("[GeminiLiveService] Requesting microphone access...");
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      console.log("[GeminiLiveService] ✅ Microphone access granted");
      
      this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => {
          console.error("[GeminiLiveService] Error sending audio:", err);
        });
      };
      
      this.mediaStreamSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioContext.destination);
      
      console.log("[GeminiLiveService] ✅ Audio pipeline connected");
    } catch (err) {
      console.error("[GeminiLiveService] ❌ Error getting user media:", err);
      callbacks.onError(new ErrorEvent('getUserMediaError', { error: err }));
    }

    return sessionPromise;
  }

  public async playAudio(base64EncodedAudioString: string) {
    if (!this.outputAudioContext) {
      console.warn("[GeminiLiveService] No output audio context");
      return;
    }
    
    try {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      const audioBuffer = await decodeAudioData(
        decode(base64EncodedAudioString), 
        this.outputAudioContext, 
        24000, 
        1
      );
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);
      source.addEventListener('ended', () => {
        this.outputAudioSources.delete(source);
      });
      
      source.start(this.nextStartTime);
      this.nextStartTime = this.nextStartTime + audioBuffer.duration;
      this.outputAudioSources.add(source);
      
      console.log("[GeminiLiveService] Playing audio chunk, duration:", audioBuffer.duration);
    } catch (err) {
      console.error("[GeminiLiveService] Error playing audio:", err);
    }
  }
  
  public interruptAudio() {
    console.log("[GeminiLiveService] Interrupting audio playback");
    for (const source of this.outputAudioSources.values()) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      this.outputAudioSources.delete(source);
    }
    this.nextStartTime = 0;
  }

  public stopSession() {
    console.log("[GeminiLiveService] Stopping session");
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log("[GeminiLiveService] Stopped track:", track.kind);
      });
      this.mediaStream = null;
    }
    
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
      this.inputAudioContext.close();
      console.log("[GeminiLiveService] Input audio context closed");
    }
    
    if (this.outputAudioContext && this.outputAudioContext.state !== 'closed') {
      this.outputAudioContext.close();
      console.log("[GeminiLiveService] Output audio context closed");
    }
    
    this.interruptAudio();
    console.log("[GeminiLiveService] ✅ Session stopped completely");
  }
}