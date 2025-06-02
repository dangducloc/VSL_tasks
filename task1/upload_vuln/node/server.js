const express = require('express');
const path = require('path');

const app = express();

const fileRoutes = require('./routes/index').fileRouter;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', fileRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
