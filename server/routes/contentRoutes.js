const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('../controllers/contentController');

const contentTypes = [
  'hero', 'about', 'room', 'gallery', 'testimonial',
  'blog', 'booking', 'setting', 'seo', 'image', 'footer', 'navigation',
];

contentTypes.forEach((type) => {
  const basePath = type === 'room' ? 'rooms'
    : type === 'blog' ? 'blogs'
    : type === 'gallery' ? 'gallery'
    : type === 'testimonial' ? 'testimonials'
    : type === 'booking' ? 'bookings'
    : type === 'image' ? 'images'
    : type === 'navigation' ? 'navigation'
    : type === 'seo' ? 'seo'
    : `${type}s`;

  // GET all / single-type
  router.get(`/${basePath}`, ctrl.getAll(type));

  // GET stats
  router.get(`/${basePath}/stats`, ctrl.getStats(type));

  // GET by slug (for blog/room)
  router.get(`/${basePath}/slug/:slug`, ctrl.getBySlug(type));

  // GET by ID
  router.get(`/${basePath}/:id`, ctrl.getById(type));

  // POST create
  router.post(`/${basePath}`, ctrl.create(type));

  // PUT update by ID
  router.put(`/${basePath}/:id`, ctrl.update(type));

  // DELETE by ID
  router.delete(`/${basePath}/:id`, ctrl.remove(type));
});

// Image upload route
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg|ico/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(null, ext && mime);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded or invalid file type',
    });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

router.post('/upload/multiple', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }
  const files = req.files.map((f) => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
  }));
  res.status(200).json({
    success: true,
    message: `${files.length} file(s) uploaded successfully`,
    data: files,
  });
});

module.exports = router;
