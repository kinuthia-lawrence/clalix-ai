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
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, "media"),
      ],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

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

  private getHtml(webview: vscode.Webview) {
    const userIconUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "user.svg")
    );
    const aiIconUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "icon.png")
    );

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
            overflow: hidden;
          }

          .message-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
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

          .code-block {
            background: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;
            font-size: 12px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
            border: 1px solid var(--vscode-panel-border);
            position: relative;
          }

          .code-block pre {
            margin: 0;
            overflow-x: auto;
          }

          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--vscode-panel-border);
          }

          .code-language {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            font-weight: 500;
            text-transform: uppercase;
          }

          .copy-btn {
            padding: 4px 8px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .copy-btn:hover {
            background: var(--vscode-button-hoverBackground);
          }

          .copy-btn.copied {
            background: var(--vscode-testing-iconPassed);
          }

          .message-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-width: 85%;
          }

          .message.user .message-wrapper {
            align-items: flex-end;
          }

          .message.assistant .message-wrapper {
            align-items: flex-start;
          }

          .message-time {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
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

          #sendBtn {
            padding: 8px 12px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            font-size: 18px;
          }

          #sendBtn:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
          }

          #sendBtn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
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
          <h1>Clalix AI</h1>
        </div>

        <div class="chat-container" id="chatContainer">
          <div class="empty-state">
            <div class="empty-state-icon">💬</div>
            <h2>Start a conversation</h2>
            <p>Ask anything and get instant answers powered by local AI</p>
          </div>
        </div>

        <div class="input-container">
          <textarea id="prompt" placeholder="Ask me anything... (Ctrl/Cmd + Enter to send)"></textarea>
          <button id="sendBtn" title="Send message">
            ↑
          </button>
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          let isLoading = false;
          const userIconUri = \`${userIconUri}\`;
          const aiIconUri = \`${aiIconUri}\`;
          let messageStartTime = 0;

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

          // Send button click handler
          sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendPrompt();
          });

          function sendPrompt() {
            const prompt = promptEl.value.trim();

            if (!prompt || isLoading) {
              return;
            }

            messageStartTime = Date.now();

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
            
            const img = document.createElement('img');
            img.src = role === 'user' ? userIconUri : aiIconUri;
            img.alt = role === 'user' ? 'User' : 'AI';
            avatarDiv.appendChild(img);

            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'message-wrapper';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            
            // Parse content for code blocks
            contentDiv.innerHTML = parseContent(content);

            wrapperDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(wrapperDiv);

            chatContainer.appendChild(messageDiv);
            scrollToBottom();

            return contentDiv;
          }

          function parseContent(text) {
            let html = escapeHtml(text);
            
            // Replace code blocks with formatted version
            html = html.replace(/\`\`\`(\w+)?\n([\s\S]*?)\`\`\`/g, (match, language, code) => {
              const lang = language || 'text';
              const cleanCode = code.trim();
              const encoded = cleanCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              const codeBlockId = 'code-' + Math.random().toString(36).substr(2, 9);
              
              return \`<div class="code-block">
                <div class="code-header">
                  <span class="code-language">\${lang}</span>
                  <button class="copy-btn" onclick="copyCode('\${codeBlockId}')">Copy</button>
                </div>
                <pre id="\${codeBlockId}"><code>\${encoded}</code></pre>
              </div>\`;
            });
            
            return html;
          }

          function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }

          function addLoadingIndicator() {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            messageDiv.id = 'loading-message';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar assistant';
            
            const img = document.createElement('img');
            img.src = aiIconUri;
            img.alt = 'AI';
            avatarDiv.appendChild(img);

            const wrapperDiv = document.createElement('div');
            wrapperDiv.className = 'message-wrapper';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'loading-indicator';
            contentDiv.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';

            wrapperDiv.appendChild(contentDiv);
            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(wrapperDiv);

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

          function copyCode(codeBlockId) {
            const codeBlock = document.getElementById(codeBlockId);
            const text = codeBlock.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
              const btn = event.target;
              const originalText = btn.textContent;
              btn.textContent = '✓ Copied';
              btn.classList.add('copied');
              
              setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
              }, 2000);
            });
          }

          function formatTime(milliseconds) {
            const seconds = Math.round(milliseconds / 1000);
            if (seconds < 60) {
              return seconds + 's';
            }
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return minutes + 'm ' + secs + 's';
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

              let contentDiv = chatContainer.querySelector('.message.assistant:last-child .message-content');
              if (!contentDiv) {
                contentDiv = addMessage('assistant', '');
              }

              const currentText = contentDiv.textContent;
              const newText = currentText + message.value;
              contentDiv.textContent = newText;
              scrollToBottom();
            } else if (message.type === 'streamEnd') {
              const loadingMsg = document.getElementById('loading-message');
              if (loadingMsg) {
                loadingMsg.remove();
              }

              // Add time indicator
              const assistantMsg = chatContainer.querySelector('.message.assistant:last-child');
              if (assistantMsg) {
                const wrapper = assistantMsg.querySelector('.message-wrapper');
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                
                const elapsed = Date.now() - messageStartTime;
                timeDiv.textContent = formatTime(elapsed);
                wrapper.appendChild(timeDiv);
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