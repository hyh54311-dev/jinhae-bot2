document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const messagesContainer = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // 입력창에서 엔터 키 처리
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    sendBtn.addEventListener('click', handleSendMessage);

    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 사용자 메시지 표시
        addMessage(message, 'user-message');
        userInput.value = '';

        // 타이핑 인디케이터 표시
        const typingIndicator = showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // 타이핑 인디케이터 제거
            hideTypingIndicator(typingIndicator);

            if (data.reply) {
                await typeMessage(data.reply, 'bot-message');
            } else {
                addMessage("죄송합니다. 답변을 가져오는 중 오류가 발생했습니다.", 'bot-message');
            }
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator(typingIndicator);
            addMessage("서버와의 연결이 원활하지 않습니다. 다시 시도해 주세요.", 'bot-message');
        }
    }

    function addMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        messagesContainer.appendChild(messageDiv);
        scrollToBottom();
    }

    // 타이핑 효과가 있는 메시지 추가
    async function typeMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messagesContainer.appendChild(messageDiv);
        
        // Markdown-like formatting (bolding)
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\n/g, '<br>');
        
        // Simple typing effect by adding text gradually
        // For a more immediate yet smooth feel, we display it quickly
        messageDiv.innerHTML = formattedText;
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        messagesContainer.appendChild(indicator);
        scrollToBottom();
        return indicator;
    }

    function hideTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});
