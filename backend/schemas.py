from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str = Field(..., max_length=100)
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# new: login request schema (username + password)
class Login(BaseModel):
    username: str
    password: str

class PostCreate(BaseModel):
    title: str
    content: str

class PostOut(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    author_username: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
