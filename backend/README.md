# Backend — Denso Hackathon (FPT 2025)

Quick instructions to run the FastAPI backend locally.

## Requirements
- Python 3.12+ (Windows)
- PostgreSQL (running and accessible)
- Git (optional)

## Environment
Copy or edit the included `.env` file at the project root:
- DATABASE_HOSTNAME (e.g. localhost)
- DATABASE_PORT (e.g. 5432)
- DATABASE_USERNAME (postgres)
- DATABASE_PASSWORD
- DATABASE_NAME
- SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, API_V1_STR

Example already provided in `.env`. Ensure PostgreSQL has the database specified in DATABASE_NAME.

## Setup (PowerShell)
1. Create virtual env and activate:
   .venv
   - python -m venv .venv
   - .\.venv\Scripts\Activate.ps1

2. Install dependencies:
   - python -m pip install --upgrade pip
   - pip install -r requirements.txt

## Database migrations (Alembic)
Ensure `.env` values are set before running migrations.

From project root:
- .venv\Scripts\alembic upgrade head
or
- python -m alembic upgrade head

If alembic command fails, run it via the virtualenv Scripts path.

## Run the app
Option A — provided launcher:
- python main.py
  This will start Uvicorn with host/port from env or defaults (0.0.0.0:8000).

Option B — direct uvicorn:
- .\.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

API docs available at:
- http://localhost:8000/docs
- OpenAPI: http://localhost:8000/openapi.json

## Static files
Uploaded/served images live in:
- ./static/images
The backend serves static files via the upload router.

## Common commands
- Run tests (if present): pytest
- Show installed packages: pip freeze
- Recreate DB schema from scratch:
  - Drop & recreate database (Postgres)
  - alembic upgrade head

## Troubleshooting
- DB connection errors: verify .env values and that Postgres is reachable from your machine.
- Alembic cannot find models: make sure imports in `alembic/env.py` include your models and `.env` is loaded.
- If server fails to import `app.main.app`, run `python main.py` to see fallback app and full traceback.

## Notes
- The project entrypoint is `main.py` (root). Production deployments should use a process manager and set proper environment variables.
- Keep SECRET_KEY private.

That's it — start the virtual environment, install requirements, run migrations, then run the server.