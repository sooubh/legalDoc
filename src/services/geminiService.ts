import { GoogleGenAI, LiveServerMessage, Modality, Blob, Content } from "@google/genai";
import type { ChatMessage } from "../types/types";

// FIX: The `LiveSession` type is not exported from `@google/genai`.
// We can infer it from the return type of the `ai.live.connect` method.
type LiveSession = Awaited<ReturnType<InstanceType<typeof GoogleGenAI>["live"]["connect"]>>;

// --- Audio Encoding/Decoding Helpers ---

// FIX: Replaced the incorrect `encode` function with the correct implementation from the Gemini API documentation. The previous version had multiple reference errors and incorrect logic.
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


// --- Main Service Class ---

export interface LiveCallbacks {
    onOpen: () => void;
    onMessage: (message: LiveServerMessage) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
}

export class GeminiLiveService {
    private ai: GoogleGenAI;
    private session: LiveSession | null = null;
    
    private inputAudioContext: AudioContext;
    private outputAudioContext: AudioContext;
    private mediaStream: MediaStream | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

    private nextStartTime = 0;
    private audioPlaybackSources = new Set<AudioBufferSourceNode>();
    private sessionPromise: Promise<LiveSession> | null = null;

    constructor() {
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
            throw new Error("VITE_GEMINI_API_KEY environment variable not set");
        }
        this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    public async startSession(systemInstruction: string, callbacks: LiveCallbacks): Promise<void> {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    this.setupMicrophone();
                    callbacks.onOpen();
                },
                onmessage: async (message: LiveServerMessage) => {
                    callbacks.onMessage(message);
                    if (message.serverContent?.interrupted) {
                        this.stopAllPlayback();
                    }
                },
                onerror: callbacks.onError,
                onclose: (e) => {
                    this.cleanup();
                    callbacks.onClose(e);
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: { parts: [{ text: systemInstruction }] },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            } as any,
        });
        this.session = await this.sessionPromise;
    }

    private setupMicrophone(): void {
        if (!this.mediaStream || !this.inputAudioContext) return;
        this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
        this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

        this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            if (this.sessionPromise) {
                 this.sessionPromise.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                 });
            }
        };

        this.mediaStreamSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.inputAudioContext.destination);
    }
    
    public async playAudio(base64Audio: string): Promise<void> {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            this.outputAudioContext,
            24000,
            1,
        );
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputAudioContext.destination);
        source.addEventListener('ended', () => {
            this.audioPlaybackSources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.audioPlaybackSources.add(source);
    }

    private stopAllPlayback(): void {
        for (const source of this.audioPlaybackSources.values()) {
            source.stop();
            this.audioPlaybackSources.delete(source);
        }
        this.nextStartTime = 0;
    }

    private cleanup(): void {
        this.stopAllPlayback();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.scriptProcessor?.disconnect();
        this.mediaStreamSource?.disconnect();
        this.session = null;
        this.sessionPromise = null;
        this.mediaStream = null;
        this.scriptProcessor = null;
        this.mediaStreamSource = null;
    }

    public stopSession(): void {
        if (this.session) {
            this.session.close();
        }
        this.cleanup();
    }
}


export async function sendTextMessage(fullHistory: ChatMessage[], document: string, language: "en" | "hi" = "en"): Promise<string> {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("VITE_GEMINI_API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    
    const contents: Content[] = fullHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const languageInstruction = `Language: ${language === 'hi' ? 'Hindi' : 'English'}. All your responses must be in ${language === 'hi' ? 'Hindi (हिंदी)' : 'English'}.`;
    
    const systemInstruction = document 
        ? `You are a helpful assistant. Please answer the user's questions based on the following context. If the answer is not found in the context, say so.\n\n${languageInstruction}\n\nCONTEXT:\n"""${document}"""`
        : `You are a helpful assistant. ${languageInstruction}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction
        }
    });

    return response.text || "No response generated";
}
