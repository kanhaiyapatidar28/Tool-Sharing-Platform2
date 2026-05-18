
import { apiFetch, formatCurrency } from './data_v2.js';

export function initChatbotLogic() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const history = document.getElementById('chat-history');
    const uploadBtn = document.getElementById('chat-upload-btn');
    const imageInput = document.getElementById('chat-image-input');
    const previewContainer = document.getElementById('chat-image-preview-container');
    const previewImg = document.getElementById('chat-image-preview');
    const removeBtn = document.getElementById('chat-image-remove');

    if (!input || !sendBtn || !history) return;

    let selectedImageBase64 = null;

    const addMessage = (text, isBot = true, suggestion = null, image = null) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isBot ? 'chat-msg--bot' : 'chat-msg--user'}`;
        
        if (image) {
            const imgEl = document.createElement('img');
            imgEl.src = image;
            imgEl.style.maxWidth = '100%';
            imgEl.style.borderRadius = '8px';
            imgEl.style.marginBottom = '8px';
            imgEl.style.display = 'block';
            msgDiv.appendChild(imgEl);
        }

        if (text) {
            const textEl = document.createElement('div');
            textEl.innerHTML = text.replace(/\n/g, '<br>');
            msgDiv.appendChild(textEl);
        }
        
        history.appendChild(msgDiv);

        if (suggestion) {
            const sugDiv = document.createElement('div');
            sugDiv.className = 'chat-suggestion';
            sugDiv.innerHTML = `
                <img src="${suggestion.photo || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">
                <div style="flex:1;">
                    <div style="font-weight:700;font-size:13px;">${suggestion.title}</div>
                    <div style="font-size:11px;color:var(--color-primary);">${formatCurrency(suggestion.price)}/day</div>
                </div>
            `;
            sugDiv.onclick = () => window.location.href = `tool-detail.html?id=${suggestion.id}`;
            history.appendChild(sugDiv);
        }

        history.scrollTop = history.scrollHeight;
    };

    const handleSend = async () => {
        const text = input.value.trim();
        const image = selectedImageBase64;
        
        if (!text && !image) return;

        input.value = '';
        selectedImageBase64 = null;
        if (previewContainer) previewContainer.style.display = 'none';

        addMessage(text, false, null, image);

        try {
            const data = await apiFetch('/chatbot/', {
                method: 'POST',
                body: JSON.stringify({ message: text, image: image })
            });

            addMessage(data.message, true, data.suggestion);
        } catch (e) {
            addMessage("Sorry, I'm having trouble connecting right now. Try again later!", true);
        }
    };

    if (uploadBtn && imageInput) {
        uploadBtn.onclick = () => imageInput.click();
        imageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    selectedImageBase64 = event.target.result;
                    if (previewImg && previewContainer) {
                        previewImg.src = selectedImageBase64;
                        previewContainer.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (removeBtn) {
        removeBtn.onclick = () => {
            selectedImageBase64 = null;
            if (previewContainer) previewContainer.style.display = 'none';
            if (imageInput) imageInput.value = '';
        };
    }

    sendBtn.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
}
