# 🏋️ GymTracker

A full-stack gym workout tracking application built for a cloud computing university assignment.

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | React 18 + Vite + TailwindCSS |
| Backend     | Node.js + Express       |
| Database    | PostgreSQL 16           |
| Auth        | JWT (jsonwebtoken)      |
| Charts      | Recharts                |
| Proxy       | Nginx                   |
| Deployment  | Docker Compose          |

## Features

- **User auth** — Register, login, JWT-protected routes
- **Workout logging** — Create sessions with name, date, duration, notes
- **Exercise tracking** — Sets, reps, weight (kg), YouTube technique links, notes
- **History** — Chronological workout log grouped by month, searchable
- **Progress charts** — Weight progression over time per exercise (Recharts)
- **Dashboard** — Weekly/total stats + recent workouts overview
- **Dark mode** — Carbon/volt design system throughout

## Project Structure

```
gymtracker/
├── backend/
│   ├── src/
│   │   ├── db/            # PostgreSQL pool + schema.sql
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── routes/        # auth, workouts, exercises, stats
│   │   └── index.js       # Express app entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, shared components
│   │   ├── context/       # AuthContext (React Context)
│   │   ├── pages/         # Dashboard, Workouts, WorkoutDetail, History, Progress
│   │   └── utils/         # Axios API client
│   ├── Dockerfile
│   ├── nginx-frontend.conf
│   └── package.json
├── nginx/
│   └── default.conf       # Reverse proxy config
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start

### 1. Clone and configure

```bash
git clone <repo-url>
cd gymtracker
cp .env.example .env
# Edit .env — at minimum set a strong DB_PASSWORD and JWT_SECRET
```

### 2. Deploy with Docker Compose

```bash
docker-compose up --build -d
```

The app will be available at **http://localhost** (port 80 by default).

### 3. View logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 4. Stop

```bash
docker-compose down
# To also remove the database volume:
docker-compose down -v
```

## API Endpoints

### Auth
| Method | Path                  | Auth | Description       |
|--------|-----------------------|------|-------------------|
| POST   | `/api/auth/register`  | —    | Register user     |
| POST   | `/api/auth/login`     | —    | Login             |
| GET    | `/api/auth/me`        | ✅   | Current user info |

### Workouts
| Method | Path                  | Auth | Description             |
|--------|-----------------------|------|-------------------------|
| GET    | `/api/workouts`       | ✅   | List all workouts       |
| GET    | `/api/workouts/:id`   | ✅   | Workout + exercises     |
| POST   | `/api/workouts`       | ✅   | Create workout          |
| PUT    | `/api/workouts/:id`   | ✅   | Update workout          |
| DELETE | `/api/workouts/:id`   | ✅   | Delete workout          |

### Exercises
| Method | Path                       | Auth | Description                |
|--------|----------------------------|------|----------------------------|
| GET    | `/api/exercises/names`     | ✅   | Unique exercise names      |
| GET    | `/api/exercises/progress`  | ✅   | Weight progress `?name=X`  |
| POST   | `/api/exercises`           | ✅   | Add exercise to workout    |
| PUT    | `/api/exercises/:id`       | ✅   | Update exercise            |
| DELETE | `/api/exercises/:id`       | ✅   | Delete exercise            |

### Stats
| Method | Path         | Auth | Description        |
|--------|--------------|------|--------------------|
| GET    | `/api/stats` | ✅   | Dashboard summary  |

## Database Schema

```sql
users        (id, username, email, password_hash, created_at)
workouts     (id, user_id, name, duration_minutes, notes, date, created_at)
exercises    (id, workout_id, name, sets, reps, weight_kg, youtube_url, notes, created_at)
```

## Development (without Docker)

### Backend
```bash
cd backend
npm install
# Create a local .env with your Postgres credentials
npm run dev   # nodemon hot-reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # Vite dev server on :5173
```

> The Vite dev server proxies `/api` to `http://backend:4000` — change the target in `vite.config.js` to `http://localhost:4000` for local dev.

## Production Notes

- Change `JWT_SECRET` and `DB_PASSWORD` to strong random values
- Set `CORS_ORIGIN` to your actual domain
- Add HTTPS via Certbot/Let's Encrypt in front of the nginx container
- PostgreSQL data persists in the `pgdata` Docker volume
