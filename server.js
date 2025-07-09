const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const messageService = require('./models/dynamomessages');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = [];

app.use(express.static(path.join(__dirname, '../frontend')));

io.on('connection', async (socket) => {
  console.log(`🟢 Connected: ${socket.id}`);
  let currentUser = {};

  try {
    const history = await messageService.getRecentMessages();
    console.log(`📜 Sending ${history.length} past messages`);
    socket.emit('chat history', history);
  } catch (err) {
    console.error('❌ Error loading history:', err.message);
  }

  socket.on('join', (data) => {
    currentUser = { ...data, id: socket.id };
    onlineUsers.push(currentUser);
    io.emit('update users', onlineUsers);
    console.log(`👤 ${currentUser.username} joined`);
  });

  socket.on('typing', ({ username }) => {
    socket.broadcast.emit('typing', { username });
  });

  socket.on('chat message', async (data) => {
    const msgData = {
      ...data,
      timestamp: Date.now()
    };

    try {
      await messageService.saveMessage(msgData);
      io.emit('chat message', msgData);
      console.log('💬 Message sent & saved:', msgData.message);
    } catch (err) {
      console.error('❌ Failed to send/save message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    const idx = onlineUsers.findIndex(u => u.id === socket.id);
    if (idx !== -1) {
      console.log(`🔴 ${onlineUsers[idx].username} disconnected`);
      onlineUsers.splice(idx, 1);
      io.emit('update users', onlineUsers);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
