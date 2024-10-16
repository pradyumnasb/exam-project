const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory
const uploadsDir = path.join(__dirname, '../uploads'); // Adjust according to your project structure
console.log("sdsadsa", uploadsDir);
// Check if the uploads directory exists; if not, create it
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage options for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Set the destination to the uploads directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Set the filename
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .pdf, .jpg, .jpeg, and .png formats are allowed!'), false);
  }
};

// Set limits for file uploads (optional)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB limit
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
}).fields([
  { name: 'quizFile', maxCount: 1 },       // Define the input name for quizFile
  { name: 'assignmentFile', maxCount: 1 }  // Define the input name for assignmentFile
]);

module.exports = upload;
