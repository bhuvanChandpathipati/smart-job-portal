# API Documentation
Base URL: `http://localhost:5000/api`. Protected routes need `Authorization: Bearer <token>`. Errors return `{ "message": "..." }` with a 4xx/5xx status.

## Auth `/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | /register | Public | Body: name, email, password(min 6), role (`student`/`recruiter`), companyName (recruiter), phone. Returns `{token,user}` |
| POST | /login | Public | Body: email, password |
| GET | /me | Any | Current user |
| PUT | /me | Any | Update name |
| PUT | /password | Any | Body: currentPassword, newPassword |

## Students `/students`
GET `/profile`, PUT `/profile` (student) | GET `/:id` (recruiter/admin: student profile)

## Recruiters `/recruiters`
GET `/profile`, PUT `/profile` (recruiter). Body: designation, phone, company{name,website,location,industry,size,description}

## Jobs `/jobs`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | / | Public | Filters: q, title, company, location, skills (comma list), jobType, experienceLevel, category, minSalary, maxSalary (LPA), page, limit |
| GET | /recommended | Student | Jobs ranked by match with `match` object |
| GET | /mine | Recruiter | Own jobs with applicant counts |
| GET | /:id | Public | Job detail. With a student token also returns match, applied, saved, hasResume |
| POST | / | Recruiter | Create job |
| PUT | /:id | Owner/Admin | Update job |
| DELETE | /:id | Owner/Admin | Delete job and its applications |

## Applications `/applications`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | / | Student | Body: jobId, coverNote. 409 if already applied |
| GET | /mine | Student | Own applications |
| GET | /recruiter | Recruiter | Query: search, status, jobId |
| GET | /all | Admin | Query: status |
| GET | /:id | Student owner / job owner / Admin | Detail with profile and match |
| PATCH | /:id/status | Recruiter owner/Admin | Body: status (Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected) |
| DELETE | /:id | Admin | Delete |

## Saved jobs `/saved-jobs` (student)
GET `/` | POST `/:jobId` | DELETE `/:jobId`

## Notifications `/notifications`
GET `/` | PATCH `/read-all` | PATCH `/:id/read` | DELETE `/:id`

## Resumes `/resumes`
POST `/upload` (multipart field `resume`, PDF, max 2 MB) | GET `/me` | DELETE `/me` (student) | GET `/student/:studentId` (recruiter with an application from that student, or admin)

## Admin `/admin`
GET `/users?role=&search=` | PATCH `/users/:id/toggle` | DELETE `/users/:id` | GET `/jobs?search=` | DELETE `/jobs/:id`

## Dashboard `/dashboard`
GET `/public` | GET `/student` | GET `/recruiter` | GET `/admin` (all values come from MongoDB aggregations)
