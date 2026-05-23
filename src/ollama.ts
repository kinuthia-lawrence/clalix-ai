import axios from "axios";

const OLLAMA_API = "http://localhost:11434/v1/chat/completions";
const MODEL = "qwen2.5-coder:3b";

export async function* streamAI(prompt: string) {
  try {
    const response = await axios.post(
      OLLAMA_API,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      },
      {
        responseType: "stream",
      }
    );

    const stream = response.data;

    for await (const chunk of stream) {
      const lines = chunk.toString().split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          
          if (data === "[DONE]") {
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch {
            // Skip parsing errors
          }
        }
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to get AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}