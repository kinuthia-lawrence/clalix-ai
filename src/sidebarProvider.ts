import * as vscode from "vscode";
import { streamAI } from "./ollama";

export class SidebarProvider
  implements vscode.WebviewViewProvider {

  public static readonly viewType = "clalix-ai.sidebar";

  constructor(
    private readonly _extensionUri: vscode.Uri
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView
  ) {

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(
      async (message) => {

        if (message.type === "askAI") {

          webviewView.webview.postMessage({
            type: "streamStart",
          });

          try {
            const stream = streamAI(message.prompt);

            for await (const chunk of stream) {
              webviewView.webview.postMessage({
                type: "streamChunk",
                value: chunk,
              });
            }

            webviewView.webview.postMessage({
              type: "streamEnd",
            });
          } catch (error) {
            webviewView.webview.postMessage({
              type: "streamError",
              value: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }
    );
  }

  private getHtml() {

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Clalix AI</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            overflow: hidden;
          }

          .header {
            padding: 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            flex-shrink: 0;
          }

          .header h1 {
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .header .icon {
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
          }

          .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .message {
            display: flex;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .message.user {
            justify-content: flex-end;
          }

          .message.assistant {
            justify-content: flex-start;
          }

          .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 14px;
            font-weight: 600;
          }

          .message-avatar.user {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
          }

          .message-avatar.assistant {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .message-content {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 8px;
            line-height: 1.5;
            word-wrap: break-word;
            white-space: pre-wrap;
          }

          .message.user .message-content {
            background: var(--vscode-inputBox-background);
            border: 1px solid var(--vscode-inputBox-border);
            color: var(--vscode-editor-foreground);
          }

          .message.assistant .message-content {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            color: var(--vscode-editor-foreground);
          }

          .message-content code {
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
          }

          .message-content pre {
            background: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            margin-top: 8px;
            font-size: 12px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
          }

          .loading-indicator {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
          }

          .loading-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--vscode-button-background);
            animation: pulse 1.4s infinite;
          }

          .loading-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .loading-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes pulse {
            0%, 80%, 100% {
              opacity: 0.4;
            }
            40% {
              opacity: 1;
            }
          }

          .error-message {
            padding: 12px 16px;
            background: var(--vscode-notificationsErrorIcon-foreground);
            color: white;
            border-radius: 8px;
            font-size: 13px;
          }

          .input-container {
            padding: 12px;
            border-top: 1px solid var(--vscode-panel-border);
            flex-shrink: 0;
            display: flex;
            gap: 8px;
          }

          .input-wrapper {
            display: flex;
            gap: 8px;
            flex: 1;
          }

          textarea {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid var(--vscode-inputBox-border);
            border-radius: 6px;
            background: var(--vscode-inputBox-background);
            color: var(--vscode-editor-foreground);
            font-family: inherit;
            font-size: 13px;
            resize: vertical;
            max-height: 100px;
            min-height: 40px;
            outline: none;
            transition: border-color 0.2s;
          }

          textarea:focus {
            border-color: var(--vscode-focusBorder);
          }

          textarea::placeholder {
            color: var(--vscode-input-placeholderForeground);
          }

          .button-group {
            display: flex;
            gap: 8px;
            align-items: flex-end;
          }

          button {
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          }

          #sendBtn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            padding: 10px 20px;
          }

          #sendBtn:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
          }

          #sendBtn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          #clearBtn {
            background: transparent;
            color: var(--vscode-button-foreground);
            border: 1px solid var(--vscode-button-border);
            padding: 10px 12px;
          }

          #clearBtn:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--vscode-descriptionForeground);
            text-align: center;
            padding: 40px;
          }

          .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          .empty-state h2 {
            font-size: 16px;
            margin-bottom: 8px;
            font-weight: 600;
          }

          .empty-state p {
            font-size: 13px;
            opacity: 0.7;
            max-width: 200px;
          }

          /* Scrollbar styling */
          .chat-container::-webkit-scrollbar {
            width: 8px;
          }

          .chat-container::-webkit-scrollbar-track {
            background: transparent;
          }

          .chat-container::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 4px;
          }

          .chat-container::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>
            <div class="icon">⚡</div>
            Clalix AI
          </h1>
        </div>

        <div class="chat-container" id="chatContainer">
          <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <h2>Start a conversation</h2>
            <p>Ask anything and get instant answers powered by local AI</p>
          </div>
        </div>

        <div class="input-container">
          <div class="input-wrapper">
            <textarea id="prompt" placeholder="Ask me anything... (Ctrl/Cmd + Enter to send)"></textarea>
          </div>
          <div class="button-group">
            <button id="sendBtn" onclick="sendPrompt()">
              <span>Send</span>
            </button>
            <button id="clearBtn" onclick="clearChat()" title="Clear chat history">
              <span>Clear</span>
            </button>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          let isLoading = false;

          const promptEl = document.getElementById('prompt');
          const sendBtn = document.getElementById('sendBtn');
          const chatContainer = document.getElementById('chatContainer');

          // Auto-resize textarea
          promptEl.addEventListener('input', () => {
            promptEl.style.height = 'auto';
            promptEl.style.height = Math.min(promptEl.scrollHeight, 100) + 'px';
          });

          // Send on Ctrl/Cmd + Enter
          promptEl.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              sendPrompt();
            }
          });

          function sendPrompt() {
            const prompt = promptEl.value.trim();

            if (!prompt || isLoading) {
              return;
            }

            // Add user message to chat
            addMessage('user', prompt);

            // Clear input
            promptEl.value = '';
            promptEl.style.height = 'auto';

            // Set loading state
            isLoading = true;
            updateButtonState();

            // Send to extension
            vscode.postMessage({
              type: 'askAI',
              prompt,
            });
          }

          function addMessage(role, content) {
            // Remove empty state if present
            const emptyState = chatContainer.querySelector('.empty-state');
            if (emptyState) {
              emptyState.remove();
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${role}\`;

            const avatarDiv = document.createElement('div');
            avatarDiv.className = \`message-avatar \${role}\`;
            avatarDiv.textContent = role === 'user' ? '👤' : '⚡';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = content;

            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);

            chatContainer.appendChild(messageDiv);
            scrollToBottom();

            return contentDiv;
          }

          function addLoadingIndicator() {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            messageDiv.id = 'loading-message';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar assistant';
            avatarDiv.textContent = '⚡';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'loading-indicator';
            contentDiv.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';

            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);

            chatContainer.appendChild(messageDiv);
            scrollToBottom();
          }

          function updateButtonState() {
            sendBtn.disabled = isLoading;
            promptEl.disabled = isLoading;
          }

          function scrollToBottom() {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }

          function clearChat() {
            chatContainer.innerHTML = \`
              <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h2>Start a conversation</h2>
                <p>Ask anything and get instant answers powered by local AI</p>
              </div>
            \`;
          }

          window.addEventListener('message', event => {
            const message = event.data;

            if (message.type === 'streamStart') {
              addLoadingIndicator();
            } else if (message.type === 'streamChunk') {
              const loadingMsg = document.getElementById('loading-message');
              if (loadingMsg) {
                loadingMsg.remove();
              }

              let assistantMsg = chatContainer.querySelector('.message.assistant:last-child');
              if (!assistantMsg) {
                assistantMsg = addMessage('assistant', '');
              } else {
                assistantMsg = assistantMsg.querySelector('.message-content');
              }

              if (assistantMsg && typeof assistantMsg.textContent === 'string') {
                assistantMsg.textContent += message.value;
                scrollToBottom();
              }
            } else if (message.type === 'streamEnd') {
              const loadingMsg = document.getElementById('loading-message');
              if (loadingMsg) {
                loadingMsg.remove();
              }
              isLoading = false;
              updateButtonState();
              promptEl.focus();
            } else if (message.type === 'streamError') {
              const loadingMsg = document.getElementById('loading-message');
              if (loadingMsg) {
                loadingMsg.remove();
              }
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-message';
              errorDiv.textContent = '❌ ' + message.value;
              chatContainer.appendChild(errorDiv);
              scrollToBottom();
              isLoading = false;
              updateButtonState();
              promptEl.focus();
            }
          });

          // Focus input on load
          promptEl.focus();
        </script>
      </body>
      </html>
    `;
  }
}