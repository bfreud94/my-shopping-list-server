// Imports for external dependencies
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const morgan = require('morgan');

// Imports for internal dependencies
const middlewares = require('./middlewares');

// Dotenv config
require('dotenv').config();

// Routes
const itemRoutes = require('./api/items');
const userRoutes = require('./api/users');

// Initialize express
const app = express();

// Port number
const port = process.env.PORT || 8000;

// Use express body parser
app.use(express.json());

// Use Morgan
app.use(morgan('common'));

// Use Helmet
app.use(helmet());

// Use CORS
app.use(cors({
    origin: process.env.NODE_ENV.trim() === 'development' ? 'http://localhost:3000' : 'https://my-shopping-list-client.vercel.app'
}));

// Base API route
app.get('/', (request, response) => {
    response.send('Base API route');
});

// Use Express Routes
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);

// Use custom middlewares
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// Starting server
app.listen(port, () => {
    // "dev": "SET NODE_ENV=development && concurrently \"cd .. && cd my-shopping-list-client && npm start\" \"nodemon server.js\""
    // eslint-disable-next-line no-console
    console.log(`Server started port on ${port}`);
});

// Connecting to the Database
mongoose.connect(`${process.env.DB_CONNECTION}`, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    // eslint-disable-next-line no-console
    console.log('Connected to Database');
});