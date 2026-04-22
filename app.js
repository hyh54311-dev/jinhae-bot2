/**
 * 진해고등학교 입학 상담 챗봇 2.0 - Core Logic
 */

const CONFIG = {
    API_KEY: "AIzaSyCm2cwCCmLLf6LlUI20xfxTm_XcUfMTeFI", // 사용자 API 키
    MODEL: "gemini-1.5-flash", // 속도 최적화를 위해 Flash 모델 적용
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
// 메세지 추가 (동적으로 생성된 요소를 반환하도록 수정)
function addMessage(role, text = "") {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return messageDiv;
}

// 메세지 내용 업데이트 (스트리밍용)
function updateMessage(messageDiv, text) {
    // 마크다운과 유사한 간단한 줄바꿈 처리
    messageDiv.innerHTML = text.replace(/\n/g, '<br>');
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

async function handleStreamingChat(prompt) {
    const loadingIndicator = showLoading();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        // 로딩 제거 후 답변용 메세지 창 생성
        loadingIndicator.remove();
        const botMessageDiv = addMessage('bot', "");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            updateMessage(botMessageDiv, fullText);
        }
    } catch (error) {
        console.error('Streaming Error:', error);
        loadingIndicator.remove();
        addMessage('bot', "서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 사용자 메시지 추가
    addMessage('user', text);
    userInput.value = '';

    // 스트리밍 답변 시작
    await handleStreamingChat(text);
});

// 퀵 액션 버튼 처리
function sendQuickMessage(text) {
    userInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
}

// 입력창 포커스 자동 유지
window.onload = () => userInput.focus();
