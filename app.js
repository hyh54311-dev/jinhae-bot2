/**
 * 진해고등학교 입학 상담 챗봇 2.0 - Core Logic
 */

const CONFIG = {
    API_KEY: "AIzaSyCm2cwCCmLLf6LlUI20xfxTm_XcUfMTeFI", // 사용자 API 키
    MODEL: "gemini-3.1-pro-preview", // 사용자 요청에 따라 최신 3.1 Pro Preview 모델 적용
    SYSTEM_PROMPT: `당신은 '진해고등학교'의 친절하고 전문적인 입학 상담 교사입니다. 
아래 제공된 [입학 상담 지식 베이스]를 바탕으로 학생과 학부모의 질문에 답변하세요.

[답변 규칙]
1. 항상 따뜻하고 다정한 존댓말을 사용하세요.
2. 반드시 [입학 상담 지식 베이스]에 근거하여 답변하세요. 
3. 지식 베이스에 없는 내용은 추측하지 말고 "정확한 안내를 위해 본교 교무실(055-546-2260)로 문의해 주시면 감사하겠습니다."라고 안내하세요.
4. 답변은 간결하면서도 핵심 정보가 눈에 잘 띄도록 구성하세요 (필요시 이모지 사용).

[입학 상담 지식 베이스]
${JSON.stringify(ADMISSION_KNOWLEDGE, null, 2)}
`
};

const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// 대화 내역 저장 (AI 컨텍스트 유지용)
let chatMessages = [];

// 초기 메시지에 시스템 시스템 프롬프트는 표시하지 않음
function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// 로딩 상태 표시
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message loading-indicator';
    loadingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return loadingDiv;
}

async function callGemini(prompt) {
    const url = `/api/chat`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });

        const data = await response.json();
        
        if (data.reply) {
            return data.reply;
        } else {
            console.error('API Response Error:', data);
            return "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다.";
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        return "서버와 통신하는 중 오류가 발생했습니다. 잠시 후 상의해 주세요.";
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 사용자 메시지 추가
    addMessage('user', text);
    userInput.value = '';

    // 봇 답변 대기
    const loadingIndicator = showLoading();
    const botResponse = await callGemini(text);
    
    // 로딩 제거 및 답변 추가
    loadingIndicator.remove();
    addMessage('bot', botResponse);
});

// 퀵 액션 버튼 처리
function sendQuickMessage(text) {
    userInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
}

// 입력창 포커스 자동 유지
window.onload = () => userInput.focus();
