const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/test-upload', upload.single('document'), (req, res) => {
  console.log('File received:', req.file);
  res.json({ 
    message: 'Upload test successful', 
    file: req.file 
  });
});

app.listen(5001, () => {
  console.log('Test server running on port 5001');
});
