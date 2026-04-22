import os
import asyncio
from datetime import datetime
import json
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from google.oauth2 import service_account
from googleapiclient.discovery import build
import google.generativeai as genai
from dotenv import load_dotenv

# .env 파일 로드 (로컬 테스트용)
load_dotenv()

# API 키 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# 구글 시트 설정
SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "")
SERVICE_ACCOUNT_INFO = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")

def log_to_google_sheet(user_msg, bot_msg):
    """상담 내역을 구글 시트에 기록"""
    if not SPREADSHEET_ID or not SERVICE_ACCOUNT_INFO:
        print("Google Sheets configuration missing. Skipping log.")
        return

    try:
        # 서비스 계정 인증
        info = json.loads(SERVICE_ACCOUNT_INFO)
        creds = service_account.Credentials.from_service_account_info(
            info, scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        service = build('sheets', 'v4', credentials=creds)

        # 데이터 구성 (시간, 질문, 답변)
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        values = [[now, user_msg, bot_msg]]
        body = {'values': values}

        # 시트의 마지막 행에 추가
        service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range='A1',
            valueInputOption='RAW',
            body=body
        ).execute()
        print(f"Logged to Google Sheet: {user_msg[:20]}...")
    except Exception as e:
        print(f"Google Sheets logging error: {e}")

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
async def chat_endpoint(request: Request, background_tasks: BackgroundTasks):
    """채팅 스트리밍 엔드포인트"""
    try:
        payload = await request.json()
        user_message = payload.get("message", "")
        
        if not user_message:
            return JSONResponse(content={"error": "메시지가 비어 있습니다."}, status_code=400)

        if not GEMINI_API_KEY:
            print("ERROR: GEMINI_API_KEY is not set!")
            return JSONResponse(content={"error": "API 키가 설정되지 않았습니다."}, status_code=500)

        # 모델 설정 (Gemini 3.1 Flash Lite Preview - 속도 최적화)
        model_name = 'gemini-3.1-flash-lite-preview' 
        print(f"Initializing model: {model_name}")
        
        model = genai.GenerativeModel(model_name)
        
        # 스트리밍 생성
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\n질문: {user_message}\n답변:",
            stream=True
        )
        
        async def stream_generator():
            full_response = ""
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
                await asyncio.sleep(0.01)
            
            # 스트리밍 완료 후 백그라운드 작업으로 구글 시트 기록 등록
            if full_response:
                background_tasks.add_task(log_to_google_sheet, user_message, full_response)

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
