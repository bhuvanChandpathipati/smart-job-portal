require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/recruiters', require('./routes/recruiters'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/saved-jobs', require('./routes/savedJobs'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/resumes', require('./routes/resumes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) { console.error('JWT_SECRET missing. Copy server/.env.example to server/.env'); process.exit(1); }
connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_job_portal')
  .then(() => app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`)))
  .catch((e) => { console.error('MongoDB connection failed. Is MongoDB running?\n', e.message); process.exit(1); });
module.exports = app;
