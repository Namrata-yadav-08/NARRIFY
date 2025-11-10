from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
# absolute imports for top-level modules
import schemas
import crud
from deps import get_db, get_current_user

router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.get("/", response_model=List[schemas.PostOut])
def list_posts(search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    posts = crud.get_posts(db, search=search)
    # Attach author_username for convenience
    result = []
    for p in posts:
        out = schemas.PostOut.from_orm(p)
        out.author_username = p.author.username
        result.append(out)
    return result

@router.get("/my", response_model=List[schemas.PostOut])
def my_posts(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    posts = crud.get_posts_by_author(db, current_user.id)
    result = []
    for p in posts:
        out = schemas.PostOut.from_orm(p)
        out.author_username = p.author.username
        result.append(out)
    return result

@router.post("/", response_model=schemas.PostOut, status_code=201)
def create_post(post_in: schemas.PostCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    post = crud.create_post(db, post_in, current_user.id)
    out = schemas.PostOut.from_orm(post)
    out.author_username = current_user.username
    return out

@router.put("/{post_id}", response_model=schemas.PostOut)
def update_post(post_id: int, post_in: schemas.PostCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this post")
    post = crud.update_post(db, post, post_in.title, post_in.content)
    out = schemas.PostOut.from_orm(post)
    out.author_username = current_user.username
    return out

@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    crud.delete_post(db, post)
    return {}

@router.get("/{post_id}", response_model=schemas.PostOut)
def get_post_detail(post_id: int, db: Session = Depends(get_db)):
    """
    Return a single post by id (public).
    """
    p = crud.get_post(db, post_id)
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    out = schemas.PostOut.from_orm(p)
    out.author_username = p.author.username
    return out
