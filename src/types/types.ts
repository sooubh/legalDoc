
export enum Status {
  IDLE = 'Idle',
  CONNECTING = 'Connecting...',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  ERROR = 'Error',
}

export interface TranscriptEntry {
  id: number;
  author: 'user' | 'model';
  text: string;
}
