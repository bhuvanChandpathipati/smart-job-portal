# Viva Questions and Answers

1. **What is the aim of your project?** To build a centralized job portal where students find and apply for jobs, recruiters manage postings and applicants, and admins monitor the platform.
2. **Why the MERN stack?** One language (JavaScript) across the stack, a rich React ecosystem, JSON end to end, and MongoDB's flexible documents suit profiles with arrays (skills, education).
3. **What is REST?** An architectural style using HTTP verbs (GET, POST, PUT, PATCH, DELETE) on resource URLs such as `/api/jobs`, returning JSON, and stateless between requests.
4. **How does authentication work?** On login the server verifies the bcrypt hash and returns a signed JWT. The client sends it in the `Authorization: Bearer` header. The `protect` middleware verifies it and loads the user.
5. **Why bcrypt?** It is a slow, salted hash designed for passwords, so stolen hashes are hard to crack. Passwords are never stored in plain text.
6. **What is a JWT?** A signed token with header, payload and signature. The server can verify it without a session store. Ours carries the user id and expires in 7 days.
7. **How is role-based authorization done?** The `authorize('recruiter')` middleware checks `req.user.role`. On the frontend `ProtectedRoute` redirects the wrong role, but the server check is the real protection.
8. **How do you prevent duplicate applications?** A unique compound index on `(job, student)` in the Application model, plus a friendly check in the controller that returns HTTP 409.
9. **Explain the recommendation algorithm.** Skill overlap = matching required skills / total required skills. Final score = 70% skills + 20% experience fit + 10% education fit. It also lists matching and missing skills and an explanation.
10. **Is it AI?** It is a rule-based, explainable matching algorithm. It needs no external AI service or API key and runs locally.
11. **How are skills compared fairly?** They are normalised: lower-cased, punctuation removed, and a trailing "js" dropped so `Node.js` equals `NodeJS`.
12. **Why Mongoose?** It adds schemas, validation, middleware (hooks), population of references and indexes on top of MongoDB.
13. **List your models.** User, StudentProfile, RecruiterProfile, Company, Job, Application, SavedJob, Notification.
14. **What relationships exist?** Profiles reference User; RecruiterProfile references Company; Job references Company and recruiter User; Application references Job and student User; SavedJob and Notification reference User/Job.
15. **Why indexes?** To speed up frequent queries (job title, skills, location, type, application status) and to enforce uniqueness (email, job+student).
16. **How does resume upload work?** Multer stores PDFs in `server/uploads/resumes`, validates MIME type and extension, limits size to 2 MB, and saves file metadata in the student profile. Replacing a resume deletes the old file.
17. **Why are resumes not served as public static files?** They contain personal data. Downloads go through authenticated endpoints; recruiters may only download resumes of students who applied to their jobs.
18. **What is middleware?** A function `(req,res,next)` that runs before the route handler, e.g. auth, validation, upload, error handling.
19. **How is validation done?** express-validator rules on routes (email format, password length, required fields), Mongoose schema validation, and client-side HTML validation.
20. **How do you handle errors?** `asyncHandler` forwards rejected promises to a central error middleware that maps duplicate keys, validation and cast errors to proper status codes and JSON messages.
21. **What is CORS and how did you configure it?** Browser rule restricting cross-origin requests. The server allows only `CLIENT_URL` (http://localhost:5173).
22. **How are dashboard charts populated?** The API uses MongoDB aggregation pipelines (`$group`, `$match`, `$year`, `$month`) and Recharts renders the result. No hard-coded numbers.
23. **What is React Context used for?** `AuthContext` stores the logged-in user and token and exposes login, register and logout to all components.
24. **How does React Router protect pages?** `ProtectedRoute` checks the user and role and redirects to login or the user's own dashboard.
25. **Why Vite?** Very fast dev server and builds using native ES modules.
26. **Why Tailwind CSS?** Utility classes give a consistent design system and responsive layouts without writing much custom CSS; dark mode uses the `dark:` variant.
27. **How is the seed script repeatable?** It uses upserts keyed on email, company name, job title+company and job+student, so re-running does not duplicate data.
28. **What happens when an admin deletes a recruiter?** Their jobs, applications to those jobs, saved-job entries, company and notifications are deleted in a cascade handled in code.
29. **How do status updates reach students?** The status endpoint saves history and creates a Notification for the student, shown in the bell badge and Notifications page.
30. **What security measures are included?** Password hashing, JWT, role checks, input validation, file type/size limits, CORS restriction, regex escaping in search, and no secrets in the frontend.
31. **What are the limitations?** No email notifications, no real-time chat, rule-based matching only, local file storage, no automated test suite yet.
32. **Future enhancements?** Resume text parsing, email/SMS alerts, interview scheduling calendar, refresh tokens, cloud storage, automated tests and deployment.
33. **How would you deploy it?** Host the React build on a static host, run Express on a Node server with MongoDB Atlas or a managed instance, set environment variables, and enable HTTPS.
34. **What is the difference between PUT and PATCH?** PUT replaces or fully updates a resource; PATCH changes part of it. We use PATCH for status changes.
35. **What is the virtual DOM?** React's in-memory representation of the UI; React diffs it against the previous version and updates only changed DOM nodes.
