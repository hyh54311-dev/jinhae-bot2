import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# 환경변수에서 API 키 로드
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Jinhae High School Chatbot API")

# 지식 베이스 파일 로드 함수
def load_knowledge():
    try:
        # api 폴더 내의 knowledge.txt 파일 읽기
        knowledge_path = os.path.join(os.path.dirname(__file__), 'knowledge.txt')
        with open(knowledge_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"지식 베이스 로드 실패: {e}")
        return "진해고등학교 입학 관련 기본 정보가 아직 준비되지 않았습니다."

KNOWLEDGE_BASE = load_knowledge()

# 시스템 프롬프트 (최신 gemini-3.1-pro-preview 대응)
SYSTEM_PROMPT = f"""너는 '진해고등학교'의 공식 입학 상담 조수야 😊. 
지원자나 학부모의 질문에 정중하고 다정한 선생님의 어조로 답변해줘.

[🚨 답변 절대 원칙]
1. 아래 제공된 [진해고등학교 지식 베이스]의 내용만을 근거로 답변해.
2. 지식 베이스에 없는 내용은 지어내지 말고 "학교 교무실(055-546-2260)로 문의바랍니다"라고 안내해.

[📚 지식 베이스]
{KNOWLEDGE_BASE}
"""

@app.get("/api/health")
async def health_check():
    """서버 상태 확인용"""
    return {"status": "healthy", "model": "gemini-3.1-pro-preview"}

@app.post("/api/chat")
async def web_chat(request: Request):
    """채팅 질문에 답변 생성"""
    try:
        payload = await request.json()
        user_utterance = payload.get("message", payload.get("userRequest", {}).get("utterance", ""))
        
        if not user_utterance:
            return {"reply": "질문을 입력해 주세요!"}

        # 최신 모델 호출
        model = genai.GenerativeModel('gemini-3.1-pro-preview') 
        response = model.generate_content(f"{SYSTEM_PROMPT}\n\n사용자 질문: {user_utterance}\n답변:")
        
        return {"reply": response.text.strip()}
    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "서버 처리 중 오류가 발생했습니다. 잠시 후 상의해 주세요."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
