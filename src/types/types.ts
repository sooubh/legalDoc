
export interface ChatMessage {
  role: "user" | "model";
  content: string;
  inProgress?: boolean;
}
