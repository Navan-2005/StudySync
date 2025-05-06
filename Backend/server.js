const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketService = require('./services/socket');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const connectDB = require('./db/db');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize Socket.io with our HTTP server
socketService.init(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/ai', aiRoutes);
app.use('/users', userRoutes);
app.use('/rooms', roomRoutes);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});