# Django Backend

This folder contains the Django + MongoDB backend for the school portal.

## Stack

- Django 5
- Django REST Framework
- JWT auth via `djangorestframework-simplejwt`
- MongoDB with mongoengine ORM
- CORS enabled for the Next.js frontend
- Docker Compose for local MongoDB

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start MongoDB locally

```bash
docker-compose up -d
```

This starts MongoDB on `localhost:27017` with the default credentials from `.env.example`.

### 4. Copy and configure `.env`

```bash
cp .env.example .env
```

Update `.env` if needed (default values should work for local dev).

### 5. Start the server

Since we're using mongoengine instead of Django ORM, there are no migrations to run.

```bash
python manage.py runserver
```

The server will be available at `http://localhost:8000`.

## API Endpoints

- `GET /api/health/` — Health check
- `POST /api/auth/login/` — Login (returns JWT)
- `GET /api/auth/me/` — Get current user profile
- `POST /api/auth/refresh/` — Refresh JWT token
- `GET /api/dashboard/<role>/summary/` — Dashboard summary for a role (admin, teacher, student, parent)
- `POST /api/dashboard/marks/` — Teacher/admin mark entry that recalculates totals, grades, and rankings
- `GET /api/dashboard/rankings/?school_class_id=<id>&term=<term>` — Class rankings for a term

## MongoDB vs Django ORM

This backend uses **mongoengine** instead of Django's ORM. This means:

- No `manage.py makemigrations` or `manage.py migrate`
- Models are defined in `apps/*/models.py` as `mongoengine.Document` subclasses
- Collections are created automatically when first accessed
- References and relationships use `mongoengine.ReferenceField`

## Notes

- This is a demo with mock dashboard data. Extend the endpoints in `apps/portal/views.py` for full CRUD operations.
- Mark entry currently uses teacher/admin-authenticated requests and recalculates a student's term result plus class ranking immediately.
- Use the admin interface at `http://localhost:8000/admin/` for manual data management (requires creating a superuser manually).
- For production, consider using MongoDB Atlas instead of local Docker.

