const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const db = require('./db');
require('dotenv').config();

// Route files
const auth = require('./routes/auth');
const images = require('./routes/images');
const clients = require('./routes/clients');
const bookings = require('./routes/bookings');
const analytics = require('./routes/analytics');
const feedback = require('./routes/feedback');
const settings = require('./routes/settings');
const albums = require('./routes/albums');
const portfolio = require('./routes/portfolio');
const users = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5001;

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// File upload
app.use(fileUpload());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/images', images);
app.use('/api/v1/clients', clients);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/feedback', feedback);
app.use('/api/v1/settings', settings);
app.use('/api/v1/albums', albums);
app.use('/api/v1/portfolio', portfolio);

// Base route
app.get('/', (req, res) => {
  res.send('Shutter CMS API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
