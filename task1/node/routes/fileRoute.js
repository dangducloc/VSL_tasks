const express = require('express');
const router = express.Router();
const fileController = require('../controller/index').fileController;

router.get('/', fileController.getUploadForm);
router.post('/upload-to-php', fileController.uploadToRemotePhp);
router.get('/image/:file', fileController.proxyImage);

module.exports = router;
