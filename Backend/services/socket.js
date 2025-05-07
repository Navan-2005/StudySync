const socketio = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketio(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    io.on('connection', (socket) => {
      console.log('New client connected');
      
      // Join room
      socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
    
    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
  }
};