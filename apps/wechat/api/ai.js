import { post } from "./request";
export function sendChat(payload) {
  const { messages, model = "openai/gpt-4o" } = payload || {};
  return post("/tools/ai-chat", { messages, model });
}
