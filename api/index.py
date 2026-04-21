import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# 환경변수에서 API 키 로드
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Kakao Admission Chatbot Webhook")


# 정적 파일 서빙 설정 (HTML, CSS, JS)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
public_path = os.path.join(BASE_DIR, 'public')

@app.get("/")
async def read_index():
    """메인 페이지(index.html)를 반환합니다."""
    index_file = os.path.join(public_path, 'index.html')
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "서버는 정상이나 index.html 파일을 찾을 수 없습니다.", "path": index_file}

# 정적 파일(CSS, JS) 마운트
if os.path.exists(public_path):
    app.mount("/static", StaticFiles(directory=public_path), name="static")

@app.get("/api/health")
async def health_check():
    """서버 상태 확인을 위한 엔드포인트"""
    return {"status": "healthy", "model": "gemini-3.1-pro-preview", "public_path": public_path}

# 지식 베이스 파일 로드 함수
def load_knowledge():
    try:
        # api 폴더 내의 knowledge.txt 파일 읽기
        knowledge_path = os.path.join(os.path.dirname(__file__), 'knowledge.txt')
        with open(knowledge_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"지식 베이스 파일 로드 실패: {e}")
        return "입학 관련 기본 정보가 없습니다."

KNOWLEDGE_BASE = load_knowledge()

# 시스템 프롬프트 (입학 상담원 역할 및 엄격한 할루시네이션 방지 지침)
SYSTEM_PROMPT = f"""너는 '진해고등학교'의 공식 입학 상담 조수야 😊. 
지원자나 학부모의 질문에 정중하고 다정한 선생님의 어조로 정확한 정보를 제공해야 해.

[🚨 답변 절대 원칙 - 반드시 지킬 것]
1. **지식 베이스 우선**: 아래 제공된 [진해고등학교 지식 베이스]의 내용만을 근거로 답변해.
2. **할루시네이션(거짓말) 엄금**: 지식 베이스에 없는 내용을 추측하거나 지어내어 답변하는 것은 학교의 신뢰도에 치명적이야. 절대 금지해.
3. **불확실한 정보 처리**: 질문에 대한 정확한 답이 [지식 베이스]에 없거나 불충분하다면, "죄송합니다. 해당 내용은 현재 제가 가진 자료에 포함되어 있지 않습니다. 더 정확한 안내를 위해 학교 교무실(055-546-2260) 또는 입학처로 직접 문의해 주시면 감사하겠습니다."라고 정중히 안내해.
4. **기숙사 관련**: 기숙사에 관한 답변을 할 때는 반드시 마지막에 "기숙사 선발 및 운영에 관한 더 자세한 상담은 기숙사부(055-546-2260)로 연락 주시기 바랍니다."라는 안내를 덧붙여줘.

[📚 진해고등학교 지식 베이스]
{KNOWLEDGE_BASE}
"""

def generate_gemini_response(prompt: str) -> str:
    """Gemini API를 호출하여 답변을 생성합니다."""
    if not GEMINI_API_KEY:
         return "죄송합니다. 봇 서버에 오류가 발생했습니다. (API 키 미설정)"
         
    try:
        # 최신 Pro 모델 적용 (gemini-3.1-pro-preview)
        model = genai.GenerativeModel('gemini-3.1-pro-preview') 
        full_prompt = f"{SYSTEM_PROMPT}\n\n사용자 질문: {prompt}\n답변:"
        response = model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "죄송합니다. 서버 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."

@app.post("/api/chat")
async def web_chat(request: Request):
    """웹 앱 및 일반 앱 인터페이스를 위한 단순화된 채팅 엔드포인트"""
    payload = await request.json()
    
    # 1. 일반 웹 앱 규격 ({ "message": "..." }) 또는 
    # 2. 카카오 규격 ({ "userRequest": { "utterance": "..." } }) 모두 지원
    user_utterance = payload.get("message")
    if not user_utterance:
        user_utterance = payload.get("userRequest", {}).get("utterance", "")

    if not user_utterance:
        bot_responseText = "말씀하신 내용을 잘 이해하지 못했어요. 다시 한 번 질문해 주시겠어요?"
    else:
        # Gemini API를 통해 답변 생성
        bot_responseText = generate_gemini_response(user_utterance)
    
    # 응답 규격 통일: 웹 앱용 단순 JSON과 카카오 호환용 구조를 함께 반환
    return {
        "reply": bot_responseText,
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "simpleText": {
                        "text": bot_responseText
                    }
                }
            ]
        }
    }

# Vercel 환경이 아닌 로컬 테스트 시 실행되는 설정
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
