from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers import auth as auth_router, posts as posts_router

# load environment variables from backend/.env (if present)
load_dotenv()

# create tables on startup (keeps simple for dev)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blog Management Dashboard")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth_router.router)
app.include_router(posts_router.router)

# quick health check
@app.get("/health")
def health():
    return {"status": "ok"}
