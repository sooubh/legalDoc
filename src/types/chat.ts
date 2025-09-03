export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  document: string;
  language: 'en' | 'hi';
  history: ChatMessage[];
  message: string;
}


