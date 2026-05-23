# Clalix AI

Clalix AI is a VS Code extension that brings offline AI assistance to your editor using local Ollama models. Get instant answers and code suggestions without relying on internet connectivity.

## Features

- **Offline AI Support**: Run entirely offline using Ollama (qwen2.5-coder:3b and other models)
- **Real-time Streaming**: Watch responses stream in real-time as they're generated
- **Code Highlighting**: Automatic syntax highlighting for code blocks with copy buttons
- **Responsive Chat UI**: Clean, modern chat interface inspired by GitHub Copilot
- **Response Timing**: See how long each response took to generate
- **Keyboard Shortcuts**: Send messages with Ctrl/Cmd + Enter

## Requirements

- **Ollama**: Download and install from [ollama.ai](https://ollama.ai)
- **Qwen2.5-Coder Model**: Run `ollama pull qwen2.5-coder:3b` (or your preferred model)
- **VS Code**: Version 1.120.0 or higher

## Getting Started

1. Install Ollama and pull the qwen2.5-coder model:
   ```bash
   ollama pull qwen2.5-coder:3b
   ollama serve
   ```

2. Install the Clalix AI extension in VS Code

3. Open the Clalix AI sidebar (⚡ icon) and start asking questions

## Usage

- Type your question in the textarea
- Press Send button (↑) or Ctrl/Cmd + Enter
- Watch the response stream in real-time
- Copy code blocks with a single click

## Performance Notes

- Optimized for CPU-only machines
- Default model: qwen2.5-coder:3b (3 billion parameters)
- Response time varies based on your hardware

## Known Issues

- Requires Ollama server running on http://localhost:11434
- First response may take longer as model loads into memory

## Release Notes

### 0.0.1

- Initial release with streaming support
- Modern chat UI with code block handling
- Response timing indicator
- Keyboard shortcuts for quick interaction

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
