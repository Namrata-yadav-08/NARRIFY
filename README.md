# NARRIFY (Human stories & ideas)

Project description
This repository contains Narrify, a full-stack application for publishing and browsing human stories and ideas. The backend is implemented with FastAPI (Python) and uses SQLAlchemy for database access and JWT for authentication. The frontend is a separate folder containing a client app that consumes the backend APIs.

Repository layout
- backend/  
  - FastAPI application code, routers, models, CRUD utilities and authentication.  
  - Key responsibilities: REST API endpoints, authentication (JWT), database models and migrations, and business logic.
- frontend/  
  - Client application . Typically contains static assets, package.json, and source files in React.  
  - Key responsibilities: user interface, calling backend APIs, handling client-side auth (store tokens), and routing.

Prerequisites
- Python 3.8+
- pip
- PostgreSQL (recommended for production) or SQLite (quick local dev)
- git (optional)
- Node.js & npm/yarn (only if frontend exists and you plan to run it)

Environment variables
Create a `.env` file in the project root or export these variables in your shell.

Required
- DATABASE_URL
  - PostgreSQL example:
    postgresql+psycopg2://<db_user>:<db_pass>@<db_host>:5432/<db_name>
  - SQLite example:
    sqlite:///./db.sqlite3
- JWT_SECRET_KEY
  - A long, random string used to sign JWTs (32+ chars recommended)

Recommended / optional
- ACCESS_TOKEN_EXPIRE_MINUTES (default e.g. 30)
- JWT_ALGORITHM (e.g. HS256)
- PORT (default 8000)
- DEBUG (true/false)

Example `.env`
DATABASE_URL=sqlite:///./db.sqlite3
JWT_SECRET_KEY=replace_with_a_long_random_secret
ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_ALGORITHM=HS256
PORT=8000

Backend: setup and run (local)
1. Clone the repo and change directory:
   git clone <repo-url>
   

2. for backend 
  cd backend and  Create and activate a Python virtual environment:
   python -m venv .venv
   Windows: .venv\Scripts\activate
   macOS / Linux: source .venv/bin/activate

3. Install backend dependencies:
   pip install -r requirements.txt

4. Configure env variables:
   - Create a `.env` at project root with the variables shown above or export them in your shell.

5. Create the database and schema:
   A. PostgreSQL
     - Create DB and user:
       sudo -u postgres psql
       CREATE DATABASE Narrify_db;
       CREATE USER Narrify_user WITH PASSWORD 'strong_password';
       GRANT ALL PRIVILEGES ON DATABASE Narrify_db TO Narrify_user;
       \q
     - Set DATABASE_URL to postgresql+psycopg2://Narrify_user:strong_password@localhost:5432/Narrify_db

   B. SQLite 
     - Use DATABASE_URL=sqlite:///./db.sqlite3 (file will be created automatically)

   C. Create tables from SQLAlchemy models (quick):
     python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"


6. Run the backend server:
   uvicorn main:app --reload --host 0.0.0.0 --port ${PORT:-8000}
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

Frontend: setup and run (if present)
1. Change into the frontend folder:
   cd frontend

2. Install dependencies:
   npm install
   or
   yarn install

3. Configure environment (frontend may require REACT_APP_API_URL or similar)
   - Create `.env` inside frontend if needed:
     REACT_APP_API_URL=http://localhost:8000

4. Run dev server:
   npm start
   or
   yarn start
   - The frontend will typically run at http://localhost:5173 and call backend APIs at the configured API URL.

Authentication & tokens
- The backend signs JWTs with JWT_SECRET_KEY and uses JWT_ALGORITHM
- Access tokens should include a "sub" claim with the username or user id.
- Frontend stores the access token (e.g., in memory or secure http-only cookies). Avoid localStorage for sensitive tokens in production without additional protections.

Common commands
- Create DB tables (non-migration): python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
- Run tests (if configured): pytest



Security notes
- Never commit `.env` or secret keys.
- For production: use secure secret management, enable HTTPS, configure CORS, and deploy behind a process manager (gunicorn + uvicorn workers or similar).
- Prefer httpOnly secure cookies for tokens in browsers where suitable.

Using MySQL on Windows (my local workflow)
Below I describe the exact steps I use on Windows when I install MySQL locally and connect the FastAPI backend to it. Adapt usernames, passwords and paths to your machine.

1) Install MySQL Server
- Download and install MySQL Community Server from https://dev.mysql.com/downloads/mysql/ (use the installer).
- During install you will choose a root password — remember it.
- Start the MySQL service (services.msc) or via PowerShell:
  Start-Service MySQL

2) Create the database and an app user
- Open a command prompt or PowerShell and run:
  mysql -u root -p
   enter the root password you set during install
  CREATE DATABASE Narrify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'Narrify_user'@'localhost' IDENTIFIED BY 'strong_password';
  GRANT ALL PRIVILEGES ON Narrify_db.* TO 'Narrify_user'@'localhost';
  FLUSH PRIVILEGES;
  EXIT;

3) Add the connection URL to your .env (or set env var)
- I put this in the project `.env`:
  DATABASE_URL=mysql+pymysql://Narrify_user:strong_password@127.0.0.1:3306/Narrify_db
- Windows (Command Prompt) temporary set:
  set DATABASE_URL=mysql+pymysql://Narrify_user:strong_password@127.0.0.1:3306/Narrify_db
- PowerShell temporary set:
  $env:DATABASE_URL = "mysql+pymysql://Narrify_user:strong_password@127.0.0.1:3306/Narrify_db"


4) Verify the connection and inspect tables
- Using the MySQL client:
  mysql -u Narrify_user -p Narrify_db
  -- enter 'strong_password'
  SHOW TABLES;
  SELECT * FROM users LIMIT 10;    -- replace `users` with your actual table name
  EXIT;

- Quick Python check (raw SQL via SQLAlchemy):
  python - <<'PY'
  import os
  from sqlalchemy import create_engine, text
  os.environ['DATABASE_URL'] = os.getenv('DATABASE_URL') or "mysql+pymysql://Narrify_user:strong_password@127.0.0.1:3306/Narrify_db"
  engine = create_engine(os.environ['DATABASE_URL'])
  with engine.connect() as conn:
      res = conn.execute(text("SHOW TABLES"))
      print("Tables:", [row[0] for row in res])
  PY

5) If something fails
- "Can't connect": check the MySQL service is running, firewall, and that the URL host/port is correct (127.0.0.1:3306).
- "No module named pymysql": install pymysql into the backend venv.
- Tables not found after create_all: ensure your models are imported/registered on Base before calling create_all.

How I usually check users/tables quickly
- I open a PowerShell, run the mysql client (mysql -u Narrify_user -p Narrify_db), then:
  SHOW TABLES;
  SELECT id, username, email FROM users LIMIT 20;
