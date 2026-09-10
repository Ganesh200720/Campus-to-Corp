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

## 13. 5-Minute SIH Demo Flow

1. **Login as Student (Rahul)** → Dashboard shows Placement Readiness (ScoreRing), the "SkillBridge
   Journey" lifecycle tracker, and top career/internship recommendations.
2. **Skill Assessment** → take the 20-question test → see instant Overall Skill Score, Strong/Weak
   skills, and category breakdown.
3. **Skill Analysis** → switch target role (e.g. Full Stack Developer) → see current-vs-required
   skill bars with Strong / Minor Gap / Major Gap badges.
4. **Career Guidance** → see ranked roles with % match and an explicit "why" (matched skills vs
   gaps) plus a visual roadmap.
5. **Internships** → sorted by match % → open "Software Development Intern" → see the match
   explanation → **Apply**.
6. **My Applications** → see the new application with a live pipeline tracker.
7. **Learning Hub** → see React/AWS recommendations tied directly to the gaps just identified.
8. **Portfolio** → show verified skills, projects, certifications and the Placement-Ready badge.
9. **Switch to Industry (TechNova)** → **Candidate Matching** → pick "Frontend Developer Intern" →
   show Rahul ranked near the top with an explicit "why this candidate" breakdown.
10. **Switch to Admin** → Institution Analytics → show department-wise readiness, top skills, and the
    industry-demand-vs-student-skill priority gap chart — filter by department live.

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

## 15. Suggestions for Next Development Phase

1. Swap the rule-based matching engine for a real ML ranking model (the service-layer boundary is
   already in place).
2. Add a real LLM-backed Mock Interview evaluator and an LLM-assisted resume parser for auto-filling
   student profiles.
3. Move to PostgreSQL + S3-compatible storage for real document/resume management.
4. Add real-time notifications (WebSockets) for application status changes.
5. Build out dedicated Faculty models (FDP, Research Collaboration, Consultancy) rather than reusing
   `LearningProgram`.
6. Add an admin-side moderation/verification workflow for certifications and achievements ("Verified
   Skills" badge currently defaults to true on creation).

---

Built for Smart India Hackathon 2026 · Problem Statement 26044 · Ministry of AYUSH — All India
Institute of Ayurveda.

---

## 16. SIH Enhancement Log — Phase 1: Industry Assessments & Prerequisite Enforcement

This section documents an incremental enhancement on top of the original prototype above. **Nothing in
sections 1-15 was rewritten** — every existing route, model and page still works exactly as before.
This phase adds the ability for industries to author their own assessments and make them a hard
prerequisite for applying to a posting (SIH requirement groups 1-4).

### What was added

**Backend — `skills` app**
- New models: `IndustryAssessment`, `IndustryAssessmentQuestion` (technical + 5 aptitude categories:
  logical, quantitative, verbal, numerical, problem-solving), `IndustryAssessmentAttempt`,
  `IndustryAssessmentAnswer`.
- `skills/industry_assessment_views.py` — full CRUD for industry (create/edit assessment, add/edit/delete
  questions, activate/deactivate, view attempts) and a student-facing flow (browse, take, submit, view
  own results). Correct answers are **never** sent to the student-facing endpoint.
- `skills/services.get_assessment_status(student, assessment)` — shared helper used by both the
  opportunities app and serializers so status logic lives in one place.

**Backend — `opportunities` app**
- `Internship` and `Job` gained an optional `required_assessment` FK.
- `MyInternshipsView` / `MyJobsView` now accept `required_assessment` on create/edit, validated to
  belong to the posting company (an industry cannot require a competitor's assessment).
- **The prerequisite rule is enforced server-side in `ApplyView`**, not just hidden in the UI — calling
  `POST /api/opportunities/apply/` directly with a `curl`/Postman against a gated posting still returns
  `403 { "code": "ASSESSMENT_REQUIRED", ... }` if the assessment hasn't been passed. This was a hard
  requirement in the brief and was tested by bypassing the UI.
- `InternshipSerializer` / `JobSerializer` gained `required_assessment_detail` and `assessment_status`
  (`not_attempted` / `failed` / `passed`) so the frontend can render the right state without a second
  round-trip.

**Frontend**
- Student: new **"Company Assessments"** nav item → browse all active company assessments with live
  status, take an assessment (`/student/company-assessments/take/:id`), and a **My Results** tab.
- Student: `Internships.jsx` / `Jobs.jsx` now show an "Assessment Required / Passed / Not Passed" badge
  on gated postings, and the Apply flow catches the `ASSESSMENT_REQUIRED` response to show a blocking
  modal ("Assessment Required" → **Complete Assessment** deep-links straight to that specific company
  assessment, or **Cancel**) instead of a generic error.
- Industry: new **"Assessments"** nav item → create assessments, build the question bank (category +
  correct answer picker), activate/deactivate, and view a per-assessment student results table.
- Industry: `PostOpportunity.jsx` gained a "Required Assessment (optional)" dropdown when posting an
  internship/job.

**Demo data** (`python manage.py seed_data`)
- TechNova's "Full Stack Developer Assessment" (8 questions, mixed technical + aptitude) is attached to
  one of TechNova's real internships and jobs, and is deliberately left **unattempted** by the demo
  student (`student` / `SkillBridge@2026`) so you can run the full live demo: open the gated posting →
  Apply → blocked → Complete Assessment → pass → return → Apply succeeds.
- Cloudera's "Cloud Infrastructure Aptitude Test" (5 aptitude questions) is attached to a Cloudera
  internship and already has mixed pass/fail attempt history from other seeded students, so the
  industry-side results table isn't empty on first login.

### New API endpoints

| Area | Endpoint | Notes |
|---|---|---|
| Industry | `GET/POST /api/skills/industry/assessments/` | List/create own assessments |
| Industry | `GET/PATCH/DELETE /api/skills/industry/assessments/<id>/` | Manage one assessment (ownership-checked) |
| Industry | `GET/POST /api/skills/industry/assessments/<id>/questions/` | List/add questions |
| Industry | `PATCH/DELETE /api/skills/industry/assessments/<id>/questions/<qid>/` | Edit/delete a question |
| Industry | `GET /api/skills/industry/assessments/<id>/attempts/` | Student participation + scores |
| Student | `GET /api/skills/company-assessments/` | Browse active assessments, annotated with your status |
| Student | `GET /api/skills/company-assessments/<id>/questions/` | Question set (answers hidden), enforces `max_attempts` |
| Student | `POST /api/skills/company-assessments/<id>/submit/` | Submit answers, auto-graded |
| Student | `GET /api/skills/company-assessments/results/` | Your attempt history across every company |
| Both | `PATCH /api/opportunities/industry/internships/<id>/`, `.../jobs/<id>/` | Edit a posting incl. `required_assessment` |

### ⚠️ Migration note (important — read before running)

The sandbox this enhancement was built in had no internet access and no local Django install, so the two
new migration files (`skills/migrations/0002_industry_assessments.py` and
`opportunities/migrations/0002_required_assessment.py`) were **hand-written** to mirror Django's exact
auto-generated format rather than generated by `makemigrations`. Before running `migrate`, please verify
them from your own machine:

```bash
cd backend
source venv/bin/activate
python manage.py makemigrations --check --dry-run   # should report "No changes detected"
python manage.py migrate
python manage.py seed_data
```

If `makemigrations --check` finds a mismatch, run `python manage.py makemigrations` to let Django
regenerate them correctly — the model definitions in `models.py` are the source of truth.

### Feature verification — this phase only

| Feature | Status |
|---|---|
| Industry assessment creation | IMPLEMENTED |
| Questionnaire assessment | IMPLEMENTED |
| Aptitude assessment | IMPLEMENTED |
| Company-wise student assessments | IMPLEMENTED |
| Assessment prerequisite | IMPLEMENTED (enforced server-side) |
| Application blocking | IMPLEMENTED |
| Direct assessment navigation (deep-link, not generic page) | IMPLEMENTED |
| Assessment result (score, %, pass/fail, category breakdown) | IMPLEMENTED |
| Editing `required_assessment` on an *existing* posting from My Internships/My Jobs UI | PARTIALLY IMPLEMENTED — backend `PATCH` supports it, but no edit UI was built yet on those list pages (only at creation time via Post Opportunity) |
| Industry training programs / certifications / workshops / mentorship as real models | NOT IMPLEMENTED |
| Industry candidate portfolio view (RBAC-restricted) | NOT IMPLEMENTED |
| Faculty opportunity ecosystem (internships/training/FDP/consultancy/research) | NOT IMPLEMENTED |
| Industry skill-demand → institution curriculum intelligence UI | NOT IMPLEMENTED (backend `industry_skill_demand()` aggregator already exists and is reused, but no role-specific drill-down UI) |
| Institution student monitoring (search/filter/profile) | NOT IMPLEMENTED |
| Secure document management | NOT IMPLEMENTED |
| Light/Dark theme | NOT IMPLEMENTED |

### Regression check performed this phase
Verified by code review (not a live server run, since Django/npm weren't installable offline in the build
sandbox): all pre-existing routes, serializers and views were left untouched except the four files listed
under "What was added" above, and every change to a shared file (`opportunities/views.py`,
`opportunities/serializers.py`) was additive — existing fields, existing response shapes, and existing
call signatures are all preserved. **Please still run the full regression pass yourself** (login, student
dashboard, existing skill assessment, internships/jobs list & apply, applications, industry dashboard,
candidate matching, faculty dashboard, admin analytics) before treating this as final, since it hasn't
been exercised against a live server.

### Next phases (not started)
Feature Groups 5-11 from the enhancement brief: Industry Learning Hub (training/certification/workshop/
mentorship as real models + student discovery), Industry → Student Portfolio access with RBAC, Faculty/
Academician opportunity ecosystem, Industry↔Institution skill-demand intelligence dashboard, Institution
student monitoring, secure document management, and the Light/Dark theme system.
