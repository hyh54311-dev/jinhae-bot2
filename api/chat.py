import os
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
import google.generativeai as genai
from dotenv import load_dotenv

# .env 파일 로드 (로컬 테스트용)
load_dotenv()

# API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI()

def load_knowledge():
    """지식 베이스 로드 (UTF-8)"""
    try:
        knowledge_path = os.path.join(os.path.dirname(__file__), 'knowledge.txt')
        if os.path.exists(knowledge_path):
            with open(knowledge_path, 'r', encoding='utf-8') as f:
                return f.read()
        return "진해고등학교 입학 안내 정보가 아직 준비되지 않았습니다."
    except Exception as e:
        print(f"Knowledge load error: {e}")
        return "지식 베이스 로딩 중 오류가 발생했습니다."

KNOWLEDGE_BASE = load_knowledge()

# 시스템 프롬프트 설정
SYSTEM_PROMPT = f"""너는 '진해고등학교'의 공식 입학 상담 전문가이자 인공지능 챗봇이야.
신입생 지원자나 학부모님께 친절하고 전문적으로 정보를 제공해줘.

[상담 지침]
1. 아래 [진해고 지식 베이스]의 내용을 바탕으로만 답변해.
2. 지식 베이스에 없는 내용은 지어내지 말고, "교무실(055-546-2260)로 문의하시면 더 정확한 안내를 받으실 수 있습니다"라고 안내해.
3. 답변은 친절하고 따뜻한 어조(해요체)를 사용해.
4. 가독성을 위해 적절한 줄바꿈과 강조(**)를 사용해.

[진해고 지식 베이스]
{KNOWLEDGE_BASE}
"""

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    """채팅 스트리밍 엔드포인트"""
    try:
        payload = await request.json()
        user_message = payload.get("message", "")
        
        if not user_message:
            return JSONResponse(content={"error": "메시지가 비어 있습니다."}, status_code=400)

        # 모델 설정 (Gemini 3.1 Pro Preview)
        model = genai.GenerativeModel('gemini-3.1-pro-preview')
        
        # 스트리밍 생성
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\n질문: {user_message}\n답변:",
            stream=True
        )
        
        async def stream_generator():
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                await asyncio.sleep(0.01)

        return StreamingResponse(stream_generator(), media_type="text/plain")

    except Exception as e:
        print(f"Server Error: {e}")
        return JSONResponse(
            content={"error": "서버 처리 중 오류가 발생했습니다."}, 
            status_code=500
        )

# 상태 확인용
@app.get("/api/health")
async def health():
    return {"status": "ok", "model": "gemini-3.1-pro-preview"}
