const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dir = path.join(__dirname, '..', 'uploads', 'resumes');
fs.mkdirSync(dir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}.pdf`)
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf';
    if (ok) return cb(null, true);
    const err = new Error('Only PDF files are allowed'); err.statusCode = 400; cb(err);
  }
});
upload.dir = dir;
module.exports = upload;
