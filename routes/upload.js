const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const path = require('path');

// Configuración de almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'bloques-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Ruta para subir bloques
router.post('/bloques', upload.single('file'), uploadController.uploadBloques);

module.exports = router;
