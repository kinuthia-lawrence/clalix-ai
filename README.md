# Clalix AI

A lightweight VS Code extension for offline AI assistance powered by [Ollama](https://ollama.ai). Ask questions and get instant answers without needing internet connectivity.

## Features

🚀 **Local AI Assistance** - Run AI models locally using Ollama for complete privacy and offline functionality

💬 **Chat Interface** - Clean, responsive chat UI similar to GitHub Copilot Ask

⚡ **Real-time Streaming** - Watch responses appear character-by-character as they're generated

📝 **Code Block Support** - Beautifully formatted code blocks with syntax highlighting and one-click copy button

⏱️ **Execution Timing** - See how long each response took to generate

🔒 **Offline-First** - No cloud dependencies, everything runs locally on your machine

## Requirements

- **Docker** - Running Ollama in a Docker container
- **Ollama** - Docker image with AI models

### Quick Setup

1. Install [Docker](https://www.docker.com/)

2. Run Ollama container:
```bash
docker run -d --name ollama -p 11434:11434 ollama/ollama
```

3. Pull a model (example with qwen2.5-coder:3b):
```bash
docker exec ollama ollama pull qwen2.5-coder:3b
```

## Installation

1. Compile and package the extension:
```bash
npm install
npm run compile
npm install -g @vscode/vsce
vsce package
```

2. Install in VS Code:
```bash
code --install-extension clalix-ai-0.0.1.vsix
```

3. Ensure Ollama container is running, then open the Clalix AI panel in the sidebar

## Usage

- **Send Message**: Click Send button or press `Ctrl+Enter` (Windows/Linux) / `Cmd+Enter` (macOS)
- **Copy Code**: Click the "Copy" button in any code block
- **Clear Chat**: Click the Clear button to reset conversation history

## Configuration

The extension connects to Ollama at `http://localhost:11434`. The current model is set to `qwen2.5-coder:3b` in the code.

To use a different model, edit `src/ollama.ts` and change the `MODEL` constant:
```typescript
const MODEL = "your-model-name";
```

Then recompile and reinstall the extension.

## Known Limitations

- Currently configured for `qwen2.5-coder:3b` model - CPU-optimized for speed
- Requires Ollama running locally on port 11434
- No model selection UI yet (planned for future releases)
- Streaming only works with models that support SSE

## Tips for Best Performance

- Use CPU-optimized models like `qwen2.5-coder:3b` for faster responses
- Keep your Docker container running in the background
- For longer responses, be patient as it streams character-by-character
- Code blocks render after the full response completes

## Release Notes

### 0.0.1

Initial release with:
- Real-time streaming responses from local Ollama
- GitHub Copilot Ask-like chat interface
- Code block rendering with copy button
- Response execution timing in minutes/seconds
- Offline-first architecture
- Clean, minimal UI

---

**Enjoy local AI assistance with Clalix AI! 🚀**
