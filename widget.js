(function() {
    const scriptTag = document.currentScript;
    const tenantId = scriptTag.getAttribute('data-tenant-id') || 'client_sarath_cv';
    const primaryColor = scriptTag.getAttribute('data-primary-color') || '#212529';
    
    // 🔗 PASTED LIVE ENDPOINT FROM YOUR CLOUD RUN SERVICE
    const BACKEND_URL = "https://metawebhook-125397097247.asia-south1.run.app/metawebhook"; 

    // Create container anchor for the widget
    const container = document.createElement('div');
    container.id = 'convexp-v11-root';
    document.body.appendChild(container);

    // Shadow DOM encapsulation protects widget styles from clashing with your portfolio CSS
    const shadowRoot = container.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
        .convexp-launcher {
            position: fixed; bottom: 25px; right: 25px;
            width: 60px; height: 60px; border-radius: 50%;
            background: ${primaryColor}; color: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; z-index: 999999; font-size: 26px; transition: transform 0.2s ease;
        }
        .convexp-launcher:hover { transform: scale(1.08); }
        
        .convexp-window {
            position: fixed; bottom: 100px; right: 25px;
            width: 380px; height: 520px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 24px; box-shadow: 0 12px 40px rgba(0,0,0,0.12);
            display: none; flex-direction: column; overflow: hidden; z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .convexp-header { background: ${primaryColor}; color: white; padding: 18px; font-weight: 600; font-size: 16px; }
        .convexp-messages { flex: 1; padding: 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        
        .message { padding: 10px 14px; border-radius: 16px; max-width: 80%; font-size: 14.5px; line-height: 1.45; word-wrap: break-word; }
        .message.ai { background: rgba(0,0,0,0.05); color: #222; align-self: flex-start; border-bottom-left-radius: 4px; }
        .message.user { background: ${primaryColor}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        
        .convexp-input-area { padding: 12px; display: flex; gap: 8px; background: rgba(255,255,255,0.6); border-top: 1px solid rgba(0,0,0,0.05); }
        .convexp-input { flex: 1; border: 1px solid rgba(0,0,0,0.15); padding: 10px 16px; border-radius: 24px; outline: none; font-size: 14px; background: white; }
        .convexp-input:focus { border-color: ${primaryColor}; }
        .convexp-send { background: ${primaryColor}; border: none; color: white; padding: 0 18px; border-radius: 24px; cursor: pointer; font-weight: 500; font-size: 14px; }
    `;
    shadowRoot.appendChild(style);

    const widgetEl = document.createElement('div');
    widgetEl.innerHTML = `
        <div class="convexp-launcher" id="launcher">💬</div>
        <div class="convexp-window" id="window">
            <div class="convexp-header">Sarath's AI Assistant</div>
            <div class="convexp-messages" id="msg-box">
                <div class="message ai">Hi there! I am Sarath's executive AI assistant. Ask me anything about his technical stack, GCP pipeline integrations, or professional background!</div>
            </div>
            <div class="convexp-input-area">
                <input type="text" class="convexp-input" id="user-in" placeholder="Ask a question...">
                <button class="convexp-send" id="send-btn">Send</button>
            </div>
        </div>
    `;
    shadowRoot.appendChild(widgetEl);

    const sessionId = 'sess_' + Math.random().toString(36).substring(2, 12);
    const launcher = shadowRoot.getElementById('launcher');
    const windowEl = shadowRoot.getElementById('window');
    const sendBtn = shadowRoot.getElementById('send-btn');
    const userIn = shadowRoot.getElementById('user-in');
    const msgBox = shadowRoot.getElementById('msg-box');

    launcher.addEventListener('click', () => {
        windowEl.style.display = windowEl.style.display === 'flex' ? 'none' : 'flex';
    });

    async function sendMessage() {
        const text = userIn.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        userIn.value = '';

        const loadingDiv = appendMessage('Thinking...', 'ai');

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-Tenant-ID': tenantId 
                },
                body: JSON.stringify({ message: text, session_id: sessionId })
            });
            const data = await response.json();
            loadingDiv.remove();
            appendMessage(data.reply, 'ai');
        } catch (error) {
            loadingDiv.remove();
            appendMessage("Unable to communicate with the AI engine.", 'ai');
            console.error("Connection Error:", error);
        }
    }

    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        msgBox.appendChild(div);
        msgBox.scrollTop = msgBox.scrollHeight;
        return div;
    }

    sendBtn.addEventListener('click', sendMessage);
    userIn.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
})();