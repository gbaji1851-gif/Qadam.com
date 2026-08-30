// History Management System via LocalStorage
const HISTORY_KEY = "Qadam_CHAT_HISTORY";
let currentChatId = null;

// Initialize History
document.addEventListener("DOMContentLoaded", () => {
    loadHistoryUI();
    
    // New Chat Button Binding
    const newChatBtn = document.querySelector('.w-full.flex.items-center') || document.getElementById('newChatBtn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChatSession);
    }
});

// Load Sidebar History List
function loadHistoryUI() {
    const historyListElem = document.getElementById('recentTasksList');
    if (!historyListElem) return;

    const history = getHistory();
    historyListElem.innerHTML = '';

    if (history.length === 0) {
        historyListElem.innerHTML = `<div class="text-xs text-slate-400 p-2">No recent chats</div>`;
        return;
    }

    history.forEach(chat => {
        const item = document.createElement('div');
        item.className = `p-2 hover:bg-slate-100 rounded-lg cursor-pointer text-xs text-slate-700 truncate ${chat.id === currentChatId ? 'bg-slate-100 font-semibold' : ''}`;
        item.innerText = chat.title || "Untitled Chat";
        item.onclick = () => loadChatSession(chat.id);
        historyListElem.appendChild(item);
    });
}

// Start a Fresh New Chat
function startNewChatSession() {
    currentChatId = null;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('chatMessages').classList.add('hidden');
    const greeting = document.getElementById('greetingContainer');
    if (greeting) greeting.classList.remove('hidden');
    loadHistoryUI();
}

// Save Current Chat Message
function saveMessageToHistory(role, text) {
    let history = getHistory();

    if (!currentChatId) {
        currentChatId = "chat_" + Date.now();
        const newSession = {
            id: currentChatId,
            title: text.substring(0, 25) + (text.length > 25 ? "..." : ""),
            messages: []
        };
        history.unshift(newSession);
    }

    const session = history.find(c => c.id === currentChatId);
    if (session) {
        session.messages.push({ role, text, timestamp: new Date().toISOString() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    loadHistoryUI();
}

// Load Selected Chat
function loadChatSession(chatId) {
    const history = getHistory();
    const session = history.find(c => c.id === chatId);
    if (!session) return;

    currentChatId = chatId;
    const chatBox = document.getElementById('chatMessages');
    const greeting = document.getElementById('greetingContainer');

    if (greeting) greeting.classList.add('hidden');
    if (chatBox) {
        chatBox.classList.remove('hidden');
        chatBox.innerHTML = '';

        session.messages.forEach(msg => {
            if (msg.role === 'user') {
                chatBox.innerHTML += `
                    <div class="flex gap-3 justify-end my-3">
                      <div class="chat-bubble-user p-3.5 rounded-2xl max-w-lg text-sm leading-relaxed bg-blue-600 text-white">
                        ${escapeHtml(msg.text)}
                      </div>
                    </div>`;
            } else {
                chatBox.innerHTML += `
                    <div class="flex gap-3 items-start my-3">
                      <img src="${CONFIG.LOGO_CENTER}" class="w-6 h-6 object-contain mt-1 rounded">
                      <div class="chat-bubble-ai p-3.5 rounded-2xl max-w-lg text-sm leading-relaxed bg-gray-100 text-gray-800">
                        ${formatResponse(msg.text)}
                      </div>
                    </div>`;
            }
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    loadHistoryUI();
}

function getHistory() {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}