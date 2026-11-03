# Smart Job Portal
**An Intelligent Platform for Job Search, Recruitment and Application Management** (MERN stack, runs 100% locally, no API keys).

## Features
- **Students:** register, profile (skills, education, experience), PDF resume upload/replace/download, job search with filters, rule-based recommendations (match %, matching/missing skills, explanation), apply (duplicates blocked), save jobs, track status, notifications.
- **Recruiters:** company profile, post/edit/delete jobs, search and filter applicants, view student profiles, download resumes, update status (Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected).
- **Admin:** dashboard with live statistics, manage students/recruiters/jobs/applications, activate/deactivate or delete users, remove inappropriate jobs, recent activity.
- JWT auth, bcrypt hashing, role-based routes, express-validator, dark mode, Recharts dashboards fed by MongoDB aggregations.

## 1. Prerequisites (Windows)
1. **Node.js 18+ LTS** from https://nodejs.org (check: `node -v`)
2. **MongoDB Community Edition** from https://www.mongodb.com/try/download/community (choose "Install as a Service"; MongoDB Compass optional)
3. **VS Code** and **Git**

Verify MongoDB is running (PowerShell):
```powershell
Get-Service MongoDB          # Status should be Running
# if stopped:  net start MongoDB   (run PowerShell as Administrator)
```
Default connection used by the project: `mongodb://127.0.0.1:27017/smart_job_portal` (the database is created automatically).

## 2. Install and run (VS Code integrated terminal)
Open the `smart-job-portal` folder in VS Code, then open **two terminals** (Terminal > New Terminal).

**Terminal 1: backend**
```powershell
cd server
copy .env.example .env
npm install
npm run seed
npm run dev
```
API: http://localhost:5000  (health check: http://localhost:5000/api/health)

**Terminal 2: frontend**
```powershell
cd client
copy .env.example .env
npm install
npm run dev
```
App: http://localhost:5173

If PowerShell blocks scripts, run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## 3. Environment variables
`server/.env` (see `.env.example`): `PORT`, `MONGO_URI`, `JWT_SECRET` (any long local string), `JWT_EXPIRES_IN`, `CLIENT_URL`, and `ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD` (used only by the seed script).
`client/.env`: `VITE_API_URL=http://localhost:5000/api`.
No API keys of any kind are required.

## 4. Demo credentials (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@smartjobportal.local | Admin@12345 (from `ADMIN_PASSWORD` in `.env`) |
| Recruiter | recruiter1@smartjobportal.local (also recruiter2, recruiter3) | Recruiter@123 |
| Student | student1@smartjobportal.local ... student10@smartjobportal.local | Student@123 |

The seed script creates 1 admin, 3 recruiters, 3 companies, 10 students, 15 jobs, 30 applications, saved jobs, notifications and demo PDF resumes for students 1-5. It is **repeatable** (running again does not duplicate records). `npm run seed:reset` wipes the database first.
Change these passwords before any real deployment.

## 5. Project structure
```
client/  React + Vite + Tailwind (pages, layouts, components, context, hooks, services)
server/  Express API (config, models, middleware, controllers, routes, utils, scripts, uploads)
docs/    PROJECT_REPORT.md, PPT_CONTENT.md, VIVA_QUESTIONS.md, SCREENSHOT_GUIDE.md, API_DOCUMENTATION.md
```

## 6. Troubleshooting
- **"MongoDB connection failed"**: start the MongoDB service (see above).
- **Network error in browser**: backend must be running on port 5000; `CLIENT_URL` in `server/.env` must be `http://localhost:5173`.
- **Port in use**: change `PORT` (and `VITE_API_URL`) or stop the other process.
- **Resume upload rejected**: only PDF files up to 2 MB are accepted.

## 7. Recommendation algorithm
`match% = 0.70 x skill overlap + 0.20 x experience fit + 0.10 x education fit`. Skill names are normalised (so `Node.js`, `NodeJS` and `node js` match). See `server/utils/recommend.js`.
