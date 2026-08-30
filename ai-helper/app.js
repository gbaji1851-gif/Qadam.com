// History Key for LocalStorage
const STORAGE_KEY = "HAWKS_CHAT_HISTORY";
let currentChatId = null;
let selectedImageData = null; // Stores Base64 Image Data

document.addEventListener("DOMContentLoaded", () => {
    // Set Logos
    const sidebarLogo = document.getElementById('sidebarLogo');
    const centerLogo = document.getElementById('centerLogo');
    
    if (sidebarLogo && typeof CONFIG !== 'undefined') sidebarLogo.src = CONFIG.LOGO_TOP_LEFT;
    if (centerLogo && typeof CONFIG !== 'undefined') centerLogo.src = CONFIG.LOGO_CENTER;

    // Enter Key Send Event
    const inputField = document.getElementById('userPrompt');
    if (inputField) {
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
    }

    // Image Upload & Preview Handler
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    selectedImageData = event.target.result;
                    
                    // Show Preview Box above textarea
                    let previewBox = document.getElementById('imagePreviewContainer');
                    if (!previewBox) {
                        previewBox = document.createElement('div');
                        previewBox.id = 'imagePreviewContainer';
                        previewBox.className = 'flex items-center gap-2 mb-2 p-1.5 bg-slate-100 rounded-lg w-max border border-slate-200';
                        const promptElem = document.getElementById('userPrompt');
                        promptElem.parentNode.insertBefore(previewBox, promptElem);
                    }
                    previewBox.innerHTML = `
                        <img src="${selectedImageData}" class="h-10 w-10 object-cover rounded-md border border-slate-300">
                        <span class="text-xs text-slate-600 font-medium truncate max-w-[140px]">${file.name}</span>
                        <button onclick="clearImagePreview()" class="text-slate-400 hover:text-red-500 text-xs px-1 font-bold">✕</button>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Load Saved Chats Sidebar
    renderHistorySidebar();
});

// Clear Image Preview
function clearImagePreview() {
    selectedImageData = null;
    const previewBox = document.getElementById('imagePreviewContainer');
    if (previewBox) previewBox.remove();
    const fileInput = document.getElementById('fileUpload');
    if (fileInput) fileInput.value = '';
}

// 1. New Chat Button Action
function startNewChat() {
    currentChatId = null;
    clearImagePreview();
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('chatMessages').classList.add('hidden');
    
    const greeting = document.getElementById('greetingContainer');
    if (greeting) greeting.classList.remove('hidden');
    
    renderHistorySidebar();
}

// 2. Handle Message Send
async function handleSend() {
    const input = document.getElementById('userPrompt');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text && !selectedImageData) return;

    const greeting = document.getElementById('greetingContainer');
    if (greeting) greeting.classList.add('hidden');
    
    const chatBox = document.getElementById('chatMessages');
    if (chatBox) chatBox.classList.remove('hidden');

    // Display User Message in UI
    appendUserMessage(text);
    input.value = '';
    
    // Save User Msg in LocalStorage History
    saveToHistory('user', text);

    await callGeminiAPI(text);
}

// 3. Render User Bubble
function appendUserMessage(text) {
    const chatBox = document.getElementById('chatMessages');
    let imageHTML = '';
    
    if (selectedImageData) {
        imageHTML = `<img src="${selectedImageData}" class="max-w-xs max-h-52 rounded-xl mb-2 border border-blue-400 object-cover">`;
    }

    chatBox.innerHTML += `
        <div class="flex gap-3 justify-end my-3">
          <div class="chat-bubble-user p-3.5 rounded-2xl max-w-lg text-sm leading-relaxed bg-blue-600 text-white flex flex-col items-end">
            ${imageHTML}
            ${text ? `<span>${escapeHtml(text)}</span>` : ''}
          </div>
        </div>`;
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 4. Render AI Bubble
function appendAIMessage(text) {
    const chatBox = document.getElementById('chatMessages');
    const logoSrc = (typeof CONFIG !== 'undefined' && CONFIG.LOGO_CENTER) ? CONFIG.LOGO_CENTER : '1stlogo.png.png';
    
    chatBox.innerHTML += `
      <div class="flex gap-3 items-start my-3">
        <img src="${logoSrc}" class="w-6 h-6 object-contain mt-1 rounded">
        <div class="chat-bubble-ai p-3.5 rounded-2xl max-w-lg text-sm leading-relaxed bg-gray-100 text-gray-800">
          ${formatResponse(text)}
        </div>
      </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 5. API Call to Gemini (Supports Image + Text)
async function callGeminiAPI(userText) {
    const chatBox = document.getElementById('chatMessages');
    const apiKey = (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY) ? CONFIG.GEMINI_API_KEY.trim() : "";

    if (!apiKey) {
        alert("Pehle config.js file mein GEMINI_API_KEY enter karein!");
        return;
    }

    const loadingId = "loader-" + Date.now();
    const logoSrc = (typeof CONFIG !== 'undefined' && CONFIG.LOGO_CENTER) ? CONFIG.LOGO_CENTER : '1stlogo.png.png';
    
    chatBox.innerHTML += `
        <div id="${loadingId}" class="flex gap-3 items-start my-3">
          <img src="${logoSrc}" class="w-6 h-6 object-contain mt-1 rounded">
          <div class="chat-bubble-ai p-3.5 rounded-2xl text-slate-400 text-sm italic">
            Thinking...
          </div>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${apiKey}`;

        // Build Payload Parts (Text + Image Data)
        const parts = [];

        // Add Image Base64 Data if attached
        if (selectedImageData) {
            const base64Data = selectedImageData.split(',')[1];
            const mimeType = selectedImageData.split(';')[0].split(':')[1];
            
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                }
            });
        }

        // Add User Text Prompt
        if (userText) {
            parts.push({ text: userText });
        } else if (selectedImageData) {
            parts.push({ text: "Iss tasveer ko dekhein aur iske baare mein detail se batayein." });
        }

        // Send Request to Gemini API
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { 
                    parts: [{ text: CONFIG.SYSTEM_PROMPT || "Your name is Qadam AI Assistant, created by Aleem/Amir Ali Murtaza." }] 
                },
                contents: [{ role: "user", parts: parts }]
            })
        });

        const data = await response.json();
        
        // Reset preview state after sending API payload
        clearImagePreview();

        if (data.error) throw new Error(data.error.message);

        const aiReply = data.candidates[0].content.parts[0].text;

        const loaderElem = document.getElementById(loadingId);
        if (loaderElem) loaderElem.remove();

        appendAIMessage(aiReply);
        saveToHistory('ai', aiReply);

    } catch (err) {
        clearImagePreview();
        const loaderElem = document.getElementById(loadingId);
        if (loaderElem) loaderElem.remove();
        
        chatBox.innerHTML += `
            <div class="text-xs text-red-500 text-center p-2 bg-red-50 rounded-lg border border-red-100 my-2">
                Error: ${err.message || "Gemini API Connection Failed!"}
            </div>`;
    }
}

// 6. LocalStorage History Methods
function getStoredHistory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveToHistory(role, text) {
    let history = getStoredHistory();

    if (!currentChatId) {
        currentChatId = "chat_" + Date.now();
        const newChat = {
            id: currentChatId,
            title: text ? (text.substring(0, 22) + (text.length > 22 ? "..." : "")) : "Image Analysis",
            messages: []
        };
        history.unshift(newChat);
    }

    const chat = history.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push({ role, text });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    renderHistorySidebar();
}

function renderHistorySidebar() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const history = getStoredHistory();
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = `<div class="p-2 text-slate-400 italic">No recent tasks</div>`;
        return;
    }

    history.forEach(chat => {
        const activeClass = chat.id === currentChatId ? 'bg-slate-200 font-semibold' : '';
        historyList.innerHTML += `
            <div onclick="loadChatSession('${chat.id}')" class="p-2 hover:bg-slate-200/60 rounded-md cursor-pointer truncate ${activeClass}">
                ${escapeHtml(chat.title)}
            </div>
        `;
    });
}

function loadChatSession(chatId) {
    const history = getStoredHistory();
    const chat = history.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    
    const greeting = document.getElementById('greetingContainer');
    if (greeting) greeting.classList.add('hidden');

    const chatBox = document.getElementById('chatMessages');
    chatBox.classList.remove('hidden');
    chatBox.innerHTML = '';

    chat.messages.forEach(msg => {
        if (msg.role === 'user') {
            appendUserMessage(msg.text);
        } else {
            appendAIMessage(msg.text);
        }
    });

    renderHistorySidebar();
}

// Helper Utilities
function formatResponse(text) {
    return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}