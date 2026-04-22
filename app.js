/**
 * 진해고등학교 입학 상담 챗봇 2.0 - Core Logic
 * Encoding: UTF-8 (No BOM)
 */

const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

/**
 * 메시지 화면 추가
 */
function addMessage(role, text = "") {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message fade-in`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(contentDiv);
    chatHistory.appendChild(messageDiv);
    
    // 자동 스크롤
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return contentDiv;
}

/**
 * 로딩 인디케이터 표시
 */
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-indicator fade-in';
    loadingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return loadingDiv;
}

/**
 * 스트리밍 대화 처리
 */
async function handleChat(prompt) {
    const loadingIndicator = showLoading();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) {
            throw new Error('서버 응답 오류 (Network response was not ok)');
        }

        // 로딩 제거 및 빈 봇 메시지 생성
        loadingIndicator.remove();
        const contentDiv = addMessage('bot', "");
        
        // 스트리밍 데이터 읽기
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            
            // 텍스트 업데이트
            contentDiv.innerHTML = fullText.replace(/\n/g, '<br>');
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    } catch (error) {
        console.error('Chat Error:', error);
        loadingIndicator.remove();
        addMessage('bot', "❌ 답변을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
}

/**
 * 폼 제출 이벤트
 */
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 사용자 메시지 추가
    addMessage('user', text);
    userInput.value = '';

    // 봇 답변 요청
    await handleChat(text);
});

/**
 * 퀵 액션 버튼 처리
 */
function sendQuickMessage(text) {
    userInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
}

// 초기 포커스
window.onload = () => userInput.focus();
