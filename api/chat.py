import os
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ?섍꼍蹂?섏뿉??API ??濡쒕뱶
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Vercel 諛고룷瑜??꾪븳 FastAPI ??珥덇린??app = FastAPI(title="Jinhae High School Chatbot API")

def load_knowledge():
    try:
        # api ?대뜑 ?댁쓽 knowledge.txt ?뚯씪 ?쎄린 (?꾩옱 ?뚯씪怨?媛숈? ?꾩튂)
        knowledge_path = os.path.join(os.path.dirname(__file__), 'knowledge.txt')
        with open(knowledge_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"吏??踰좎씠??濡쒕뱶 ?ㅽ뙣: {e}")
        return "吏꾪빐怨좊벑?숆탳 ?낇븰 愿??湲곕낯 ?뺣낫媛 ?꾩쭅 以鍮꾨릺吏 ?딆븯?듬땲??"

KNOWLEDGE_BASE = load_knowledge()

# ?쒖뒪???꾨＼?꾪듃 (理쒖떊 gemini-3.1-flash-lite-preview ???
SYSTEM_PROMPT = f"""?덈뒗 '吏꾪빐怨좊벑?숆탳'??怨듭떇 ?낇븰 ?곷떞 議곗닔???삃. 
吏?먯옄???숇?紐⑥쓽 吏덈Ц???뺤쨷?섍퀬 ?ㅼ젙???좎깮?섏쓽 ?댁“濡??듬??댁쨾.

[?슚 ?듬? ?덈? ?먯튃]
1. ?꾨옒 ?쒓났??[吏꾪빐怨좊벑?숆탳 吏??踰좎씠?????댁슜留뚯쓣 洹쇨굅濡??듬???
2. 吏??踰좎씠?ㅼ뿉 ?녿뒗 ?댁슜? 吏?대궡吏 留먭퀬 "?숆탳 援먮Т??055-546-2260)濡?臾몄쓽諛붾엻?덈떎"?쇨퀬 ?덈궡??

[?뱴 吏??踰좎씠??
{KNOWLEDGE_BASE}
"""



@app.get("/api/health")
async def health_check():
    """Vercel?먯꽌 API ?묐룞 ?щ?瑜??뺤씤?섍린 ?꾪븳 ?붾뱶?ъ씤??""
    return {"status": "healthy", "model": "gemini-3.1-flash-lite-preview"}

@app.post("/api/chat")
async def web_chat(request: Request):
    """梨꾪똿 吏덈Ц??????듬????앹꽦?섏뿬 ?ㅼ떆媛??ㅽ듃由щ컢?쇰줈 ?꾩넚?⑸땲??"""
    try:
        payload = await request.json()
        user_utterance = payload.get("message", payload.get("userRequest", {}).get("utterance", ""))
        
        if not user_utterance:
            return JSONResponse(content={"reply": "吏덈Ц???낅젰??二쇱꽭??"}, status_code=400)

        # Gemini 3.1 Flash Lite 紐⑤뜽 ?몄텧 (?띾룄 理쒖쟻??
        model = genai.GenerativeModel('gemini-3.1-flash-lite-preview') 
        response = model.generate_content(
            f"{SYSTEM_PROMPT}\n\n?ъ슜??吏덈Ц: {user_utterance}\n?듬?:",
            stream=True
        )
        
        async def event_generator():
            for chunk in response:
                if chunk.text:
                    yield chunk.text
                await asyncio.sleep(0.01) # 遺?쒕윭??異쒕젰???꾪븳 誘몄꽭 吏??
        return StreamingResponse(event_generator(), media_type="text/plain")

    except Exception as e:
        print(f"Error during Gemini processing: {e}")
        return JSONResponse(
            content={"reply": "?쒕쾭 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?좎떆 ???곸쓽??二쇱꽭??"}, 
            status_code=500
        )

# 濡쒖뺄 ?뚯뒪?몄슜 (vercel dev ?깆쑝濡??ㅽ뻾 ??
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

