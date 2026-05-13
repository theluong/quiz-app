require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const PORT = process.env.VERCEL ? 3000 : (process.env.PORT || 5000);
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;