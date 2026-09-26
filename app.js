/**
 * 진해고등학교 입학 상담 챗봇 2.0 - Core Logic
 * Encoding: UTF-8 (No BOM)
 */

const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

/**
 * HTML 특수문자 이스케이프 (XSS 공격 방어)
 */
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 안전한 텍스트 포맷팅 (XSS 방어 + 줄바꿈 및 강조 보존)
 */
function formatMessage(text) {
    if (!text) return "";
    let escaped = escapeHtml(text);
    // **강조**를 안전하게 <strong> 태그로 변환
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return escaped.replace(/\n/g, '<br>');
}

/**
 * 메시지 화면 추가
 */
function addMessage(role, text = "") {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message fade-in`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(text);
    
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

// 대화 흐름 저장을 위한 전역 기록 배열
let conversationHistory = [];

/**
 * 스트리밍 대화 처리
 */
async function handleChat(prompt) {
    const loadingIndicator = showLoading();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: prompt,
                history: conversationHistory.slice(0, -1) // 현재 질문 직전까지의 대화 기록 전송
            })
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
            
            // 텍스트 업데이트 (안전한 포맷팅 적용)
            contentDiv.innerHTML = formatMessage(fullText);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }

        // 봇 답변 기록에 추가
        conversationHistory.push({ role: 'bot', message: fullText });

        // 대화 기록 최대 10개(5턴)로 제한하여 슬라이싱 (서버 부하 및 토큰 최적화)
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
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

    if (text.length > 300) {
        alert("질문은 300자 이내로 입력해주세요.");
        return;
    }

    // 사용자 메시지 화면 표시 및 대화 기록 추가
    addMessage('user', text);
    conversationHistory.push({ role: 'user', message: text });
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
