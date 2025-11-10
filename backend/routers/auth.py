from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# use absolute imports (modules live at backend root)
import schemas
import crud
import auth
from deps import get_db, get_current_user

# new: logging
import logging
logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        if crud.get_user_by_username(db, user_in.username) or crud.get_user_by_email(db, user_in.email):
            raise HTTPException(status_code=400, detail="Username or email already registered")
        user = crud.create_user(db, user_in)
        return user
    except HTTPException:
        # re-raise expected HTTP errors
        raise
    except Exception as e:
        # log full traceback to console/uvicorn logs for debugging
        logger.exception("Unexpected error during user registration")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.Login, db: Session = Depends(get_db)):
    # expecting username and password fields in body
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    token = auth.create_access_token({"sub": user.username, "user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}

# new: return current user (verify JWT and user loading)
@router.get("/me", response_model=schemas.UserOut)
def me(current_user = Depends(get_current_user)):
    return current_user
