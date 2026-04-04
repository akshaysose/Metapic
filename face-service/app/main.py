from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from .model_manager import ModelManager
from typing import List
from pydantic import BaseModel

app = FastAPI(title='KwikPic Face Service (InsightFace)')

model_mgr = ModelManager()

class UrlsRequest(BaseModel):
    urls: List[str]

@app.post("/embed")
async def embed_file(file: UploadFile = File(...)):
    content = await file.read()
    embeddings = model_mgr.embed_bytes(content)
    embedding = embeddings[0].tolist() if embeddings else []
    return JSONResponse({
        "embedding": embedding,
        "embeddings": [e.tolist() for e in embeddings],
        "face_count": len(embeddings)
    })

@app.post("/embed-urls")
async def embed_urls(req: UrlsRequest):
    res = []
    for url in req.urls:
        embeddings = model_mgr.embed_url(url)
        res.append({
            "url": url,
            "embedding": embeddings[0].tolist() if embeddings else [],
            "embeddings": [e.tolist() for e in embeddings],
            "face_count": len(embeddings)
        })
    return {"items": res}

@app.get("/health")
async def health():
    return {"ok": True}

# For local debug:
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
