from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# --- updated dotenv loading: prefer backend/.env, fall back to backend/.env, then default search ---
here = Path(__file__).resolve().parent
env_path = here / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif (here / ".env").exists():
    # helpful fallback for quick tests if .env wasn't created yet
    load_dotenv(dotenv_path=here / ".env")
else:
    # final fallback: let python-dotenv search the current working directory
    load_dotenv()

# prefer pbkdf2_sha256 to avoid bcrypt 72-byte limit for new hashes,
# keep bcrypt in list so verify still accepts existing bcrypt hashes
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_to_a_strong_secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", "120"))

import logging
logger = logging.getLogger("uvicorn.error")

def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except ValueError as ve:
        # bcrypt can raise "password cannot be longer than 72 bytes"
        logger.warning("Hashing fallback: %s. Falling back to pbkdf2_sha256.", ve)
        # explicitly use pbkdf2_sha256 to avoid bcrypt limit
        return pwd_context.hash(password, scheme="pbkdf2_sha256")
    except Exception:
        # as a last resort, re-raise so upper layer logs and returns 500
        raise

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: int = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=(expires_delta or JWT_EXP_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

# --- added/updated helper for DB connection building & testing ---
def get_database_url() -> str:
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "") or ""
    db = os.getenv("MYSQL_DB", "blogdb")
    password_enc = quote_plus(password)
    return f"mysql+pymysql://{user}:{password_enc}@{host}:{port}/{db}"

def test_db_connection():
    host = os.getenv("MYSQL_HOST")
    port = os.getenv("MYSQL_PORT")
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_PASSWORD")
    db = os.getenv("MYSQL_DB")
    print("Loaded env values:")
    print("  MYSQL_HOST:", host)
    print("  MYSQL_PORT:", port)
    print("  MYSQL_USER:", user)
    print("  MYSQL_PASSWORD:", "<SET>" if password else "<EMPTY or not set>")
    print("  MYSQL_DB:", db)
    
    url = get_database_url()
    engine = create_engine(url, pool_pre_ping=True)
    try:
        with engine.connect() as conn:
            # use sqlalchemy.text() so SQLAlchemy accepts the statement in 2.x
            conn.execute(text("SELECT 1"))
        print("\nDB connection OK")
    except Exception as e:
        print("\nDB connection failed:", e)
        print("Connection URL used (password masked):")
        parts = url.split("@")
        if len(parts) == 2:
            creds, hostpart = parts
            if ":" in creds:
                userpart = creds.split("://", 1)[1]
                user_safe = userpart.split(":", 1)[0]
                print(f"  {url.split('://',1)[0]}://{user_safe}:<masked>@{hostpart}")
        else:
            print("  ", url)
        print("\nIf you used special characters in the password, keep them but ensure they are in .env.")
        print("You can also URL-encode the password in .env (or let this helper encode it).")

# --- new helper: print jwt settings and produce a short-lived sample token for local testing ---
def _mask(s: str, keep=4):
    if not s:
        return "<empty>"
    if len(s) <= keep * 2:
        return "*" * len(s)
    return s[:keep] + "*" * (len(s) - keep * 2) + s[-keep:]

def print_jwt_info(example_sub: str = "testuser", example_user_id: int = 1, minutes: int | None = None):
    """
    Print masked JWT config and an example token (signed with current JWT_SECRET).
    Usage (from backend folder with venv active):
      python -c "from auth import print_jwt_info; print_jwt_info()"
    """
    mins = minutes or JWT_EXP_MINUTES
    print("JWT configuration:")
    print("  JWT_SECRET:", _mask(JWT_SECRET))
    print("  JWT_ALGORITHM:", JWT_ALGORITHM)
    print("  JWT_EXP_MINUTES:", mins)
    # create example token
    tok = create_access_token({"sub": example_sub, "user_id": example_user_id}, expires_delta=mins)
    print("\nExample token (use only for local testing):")
    print(tok)
    print("\nDecode check (payload):", decode_access_token(tok))
