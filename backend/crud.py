from sqlalchemy.orm import Session
import models
import schemas
import auth

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed = auth.hash_password(user.password)
    db_user = models.User(username=user.username, email=user.email, password_hash=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not auth.verify_password(password, user.password_hash):
        return None
    return user

def create_post(db: Session, post: schemas.PostCreate, author_id: int):
    db_post = models.Post(title=post.title, content=post.content, author_id=author_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 100, search: str | None = None):
    q = db.query(models.Post).join(models.User)
    if search:
        like = f"%{search}%"
        q = q.filter((models.Post.title.like(like)) | (models.Post.content.like(like)))
    posts = q.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

def get_post(db: Session, post_id: int):
    return db.query(models.Post).filter(models.Post.id == post_id).first()

def get_posts_by_author(db: Session, author_id: int):
    return db.query(models.Post).filter(models.Post.author_id == author_id).order_by(models.Post.created_at.desc()).all()

def update_post(db: Session, db_post: models.Post, title: str, content: str):
    db_post.title = title
    db_post.content = content
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db: Session, db_post: models.Post):
    db.delete(db_post)
    db.commit()
