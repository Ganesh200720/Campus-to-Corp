# SkillBridge

**"Bridging Academic Skills with Industry Opportunities"**

A working prototype for **Smart India Hackathon 2026** — Problem Statement ID **26044**:
*"Portal for Academia - Industry collaboration for Skill Mapping, Internships and Placement"*
(Ministry of AYUSH / All India Institute of Ayurveda)

SkillBridge is a centralized Academia–Industry Collaboration Portal that measures student skills,
identifies gaps against real industry benchmarks, maps students to career roles, and connects them
with internships, jobs, learning programs and mentorship — while giving industry a two-way,
explainable candidate-matching engine and giving institutions a live readiness dashboard.

This is a **real, runnable full-stack application** — not a mockup. Every button either performs a
real action against the database or navigates to an implemented feature.

---

## 1. Project Overview

Four role-based portals, one shared intelligence layer:

| Role | Can do |
|---|---|
| **Student** | Take skill assessments, see skill-gap analysis, get explainable career/internship/job recommendations, apply and track applications, use the Learning Hub, practice Mock Interviews, and maintain a verified digital Portfolio. |
| **Industry / Recruiter** | Post internships & jobs, see incoming applications, move candidates through a hiring pipeline, and see a ranked, *explained* list of best-fit candidates for any posting. |
| **Faculty / Academician** | View industry-driven workshops, FDPs and mentorship programs, and see live industry skill-demand data relevant to curriculum planning. |
| **Institution / Admin** | See institution-wide analytics: assessment coverage, average skill score, placement readiness, internship participation, placement rate, top skills, and industry-demand skill gaps — filterable by department and year. |

The core differentiator is **SkillBridge Intelligence**: every match score, gap, and recommendation
comes with a transparent "why" — computed by a deterministic, auditable scoring algorithm (no
opaque black box, no unImplemented "AI" claims). The service layer is structured so a real ML/LLM
model can be swapped in later without touching any caller.

---

## 2. Architecture

```
skillbridge/
├── backend/     Django + Django REST Framework API (SQLite)
└── frontend/    React + Vite + Tailwind CSS SPA
```

- **Auth**: JWT (access + refresh), role embedded in the token, enforced server-side on every
  endpoint (not just hidden in the UI).
- **Matching engine**: `backend/skills/services.py` — role benchmark profiles, skill-gap analysis,
  weighted opportunity matching, candidate ranking, placement-readiness scoring, and industry demand
  aggregation. Pure functions, easily testable, easily replaceable with a real model later.
- **Frontend**: role-aware routing (`ProtectedRoute`), a shared dashboard shell, and a small set of
  reusable components (`ScoreRing`, `MatchBadge`, `StatCard`, etc.) reused across every page for a
  consistent, modern SaaS look.

---

## 3. Technologies

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React icons
**Backend:** Python, Django, Django REST Framework, SimpleJWT, django-cors-headers
**Database:** SQLite (file-based, zero-config — migrating to PostgreSQL only requires changing
`DATABASES` in `project/settings.py`)

---

## 4. Installation Steps

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Clone / extract
Extract this project and open a terminal in the `skillbridge/` folder.

---

## 5. Backend Setup

```bash
cd backend
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

---

## 6. Frontend Setup

```bash
cd frontend
npm install
```

The frontend reads the API base URL from `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```
This is already set correctly for local development — no changes needed.

---

## 7. Database Setup

From the `backend/` folder (with the virtual environment activated):

```bash
python manage.py migrate
```

This creates `db.sqlite3` with all tables (Users, Profiles, Skills, Assessments, Internships, Jobs,
Applications, Projects, Certifications, Achievements, Interviews, and more).

---

## 8. Seed Data Instructions

```bash
python manage.py seed_data
```

This populates:
- 25 core skills (technical + soft) and 38 real assessment questions
- 4 demo accounts (see below) + 12 additional students with randomised, realistic skill profiles
- 8 demo companies, 16 internships, 10 jobs (each with real required-skill sets and deadlines)
- 12 learning programs (courses, certifications, workshops, mentorships)
- Projects, certifications and achievements per student
- 24 realistic applications spread across every pipeline status
- A role-specific mock-interview question bank (Frontend / Backend / Data Scientist / Full Stack)

**Rerunning `seed_data` wipes and regenerates all demo data** — safe to run any time you want a
fresh, consistent demo state.

---

## 9. Demo Credentials

| Role | Username | Password |
|---|---|---|
| Student (Rahul Sharma) | `student` | `SkillBridge@2026` |
| Industry (TechNova Solutions) | `industry` | `SkillBridge@2026` |
| Faculty (Dr. Anita Verma) | `faculty` | `SkillBridge@2026` |
| Institution Admin | `admin` | `SkillBridge@2026` |

The login screen also has **one-click demo login buttons** for all four roles — no typing required
for a live judge demo.

---

## 10. How to Run

**Terminal 1 — backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

(Django admin is available at http://localhost:8000/admin/ — create a superuser with
`python manage.py createsuperuser` if you want to inspect raw data.)

---

## 11. API Overview

All endpoints are prefixed `/api/` and (except login) require `Authorization: Bearer <access_token>`.

| Area | Endpoint | Notes |
|---|---|---|
| Auth | `POST /auth/login/`, `POST /auth/login/refresh/`, `GET /auth/me/` | JWT auth, returns role + profile |
| Skills | `GET /skills/skills/`, `GET /skills/my-scores/` | Skill catalogue & student scores |
| Assessment | `GET /skills/assessment/questions/`, `POST /skills/assessment/submit/`, `GET /skills/assessment/history/` | Random 20-question assessment, auto-scored |
| Intelligence | `GET /skills/gap/<role>/`, `GET /skills/recommend-roles/`, `GET /skills/placement-readiness/`, `GET /skills/demand/` | The core matching/analytics engine |
| Internships & Jobs | `GET/POST /opportunities/internships/`, `GET/POST /opportunities/jobs/`, `POST /opportunities/apply/`, `GET /opportunities/my-applications/` | Search, filter, sort by match %, apply, track |
| Learning | `GET /opportunities/learning-programs/?personalized=1` | Personalized to skill gaps |
| Industry | `GET/POST /opportunities/industry/internships/`, `GET/POST /opportunities/industry/jobs/`, `GET /opportunities/industry/applications/`, `PATCH /opportunities/applications/<id>/status/`, `GET /opportunities/candidate-matches/` | Posting, pipeline management, ranked candidates |
| Portfolio | `GET /portfolio/me/`, `POST /portfolio/projects/`, `POST /portfolio/certifications/`, `POST /portfolio/achievements/` | Digital portfolio + placement-ready indicator |
| Mock Interview | `GET /interviews/roles/`, `GET /interviews/questions/`, `POST /interviews/submit/` | Rule-based keyword + depth scoring |
| Analytics | `GET /analytics/overview/?department=&year=` | Institution-wide dashboard data |

---

## 12. Project Structure

```
backend/
  project/           settings, root urls
  accounts/           User, StudentProfile, IndustryProfile, FacultyProfile, InstitutionProfile
  skills/             Skill, AssessmentQuestion/Result, matching engine (services.py), seed_data command
  opportunities/       Internship, Job, LearningProgram, Application
  portfolio/          Project, Certification, Achievement
  interviews/         InterviewQuestion, MockInterview
  analytics/          Institution analytics endpoint

frontend/src/
  components/         ScoreRing, MatchBadge, StatCard, LoadingState, EmptyState, ProtectedRoute
  context/            AuthContext (JWT storage, auto-refresh)
  layouts/            DashboardLayout (role-aware sidebar/header)
  services/           api.js (Axios instance with token refresh)
  pages/
    Landing.jsx, Login.jsx
    student/          Dashboard, Profile, Assessment, SkillAnalysis, CareerGuidance,
                       Internships, Jobs, MyApplications, LearningHub, MockInterview, Portfolio
    industry/          Dashboard, PostOpportunity, MyInternships, MyJobs, Applications, CandidateMatching
    faculty/           Dashboard, Opportunities
    admin/             Institution Analytics Dashboard
```

---

## 14. Known Limitations

- Matching/recommendation logic is a transparent, deterministic weighted-scoring algorithm — **not**
  a trained ML model. This is intentional for a judge-explainable P0 prototype; the service layer
  (`recommendationService`-equivalent functions in `skills/services.py`) is isolated specifically so
  a real model can be substituted later without touching any view or frontend code.
  Mock Interview answer scoring is similarly rule-based (keyword + length heuristics), and is stated
  as such in the UI — no unearned AI claims.
- Resume/document upload is tracked as a boolean flag (`resume_uploaded`) rather than actual file
  storage, to keep the prototype dependency-free and easy to run locally.
- Faculty "opportunities" (workshops, mentorship) reuse the real `LearningProgram` model (filtered by
  type) rather than a separate dedicated model — real DB-backed data, just modelled economically for
  a P1 feature.
- Email/notifications are not wired up (no SMTP dependency by design).
- No production deployment config (WSGI/ASGI server, PostgreSQL, HTTPS) — intentionally out of scope
  for a local-first hackathon prototype, but the codebase is structured for a straightforward
  migration (see Architecture section).

---
Built for Smart India Hackathon 2026 · Problem Statement 26044 · Ministry of AYUSH — All India
Institute of Ayurveda.
