const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const { log } = require('console');

const BLOCKED_MIME_TYPES = [
  'application/x-php',
  'application/x-httpd-php',
  'application/javascript',
  'text/javascript',
  'application/x-sh',
  'application/x-executable',
  'application/x-msdownload'
];

const storage = multer.diskStorage({
    destination: 'temp/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const filename = file.originalname.toLowerCase();
    const parts = filename.split('.');
    log(parts[0]==='');
    const ext = parts.length > 1 ? '.' + parts[1] : '';

    const mime = file.mimetype.toLowerCase();

    const dangerous = [
        '.php', '.phtml', '.php3', '.php4', '.php5', '.phps','phar',
        '.asp', '.aspx', '.jsp', '.jspx', '.sh', '.cgi',
        '.exe', '.bat', '.cmd', '.com', '.vbs', '.vbe',
        '.wsf', '.wsh', '.ps1', '.psm1', '.py', '.pl', '.rb',
        '.jar', '.class', '.dll', '.scr', '.msi'
    ];

    if (dangerous.includes(ext)) {
        return cb(new Error(`❌ Extension ${ext} is blocked.`));
    }
    if (parts[0] === '' || parts[0].length > 100) {
        return cb(new Error('❌ Invalid filename or too long.'));
    }
    if (BLOCKED_MIME_TYPES.includes(mime)) {
        return cb(new Error(`❌ Suspicious MIME type: ${mime}`));
    }

    cb(null, true); // allow file
};


const upload = multer({ storage, fileFilter }).single('file');

const REMOTE_PHP_UPLOAD_URL = 'http://php/upload.php';
const REMOTE_FILE_FETCH_URL = 'http://php/images/';

exports.getUploadForm = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
};

exports.uploadToRemotePhp = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send(`❌ Upload error: ${err.message}`);
        }
        if (!req.file) {
            return res.status(400).send('❌ No file uploaded or invalid type');
        }

        try {
            const form = new FormData();
            form.append('file', fs.createReadStream(req.file.path), req.file.originalname);

            const response = await axios.post(REMOTE_PHP_UPLOAD_URL, form, {
                headers: form.getHeaders(),
                maxBodyLength: Infinity
            });

            fs.unlink(req.file.path, () => {});

            const uploadedFile = req.file.originalname;

            res.send(`
                <h3>✅ Remote server response:</h3>
                <pre>${response.data}</pre>
                <a href="/">⬅ Upload another file</a><br>
                <a href="/image/${encodeURIComponent(uploadedFile)}" target="_blank">🖼 View uploaded file</a>
            `);
        } catch (uploadErr) {
            console.error('Upload error:', uploadErr.message);
            res.status(500).send(`❌ Upload failed: ${uploadErr.message}`);
        }
    });
};

exports.proxyImage = async (req, res) => {
    const filename = path.basename(req.params.file);
    try {
        const remoteUrl = REMOTE_FILE_FETCH_URL + encodeURIComponent(filename);
        const response = await axios.get(remoteUrl, { responseType: 'stream' });

        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        response.data.pipe(res);
    } catch (err) {
        console.error(`❌ Error fetching remote file: ${err.message}`);
        res.status(404).send('❌ File not found or remote error.');
    }
};
