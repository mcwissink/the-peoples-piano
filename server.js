const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const express  = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const APP_PATH = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

// Express server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(APP_PATH));
app.use('*', express.static(APP_PATH));

// Socket.io
const users = {};
io.on('connection', socket => {
  socket.on('join', name => {
    users[socket.id] = name;
    // Send all the pianists that are connected
    socket.emit('users', Object.values(users).filter(u => u !== null));
    // Tell all the other users that a new one connected
    socket.broadcast.emit('user_connected', name);
  })
  socket.on('piano', note => {
    socket.broadcast.emit('piano', note);
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('user_disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

http.listen(PORT, () => console.log(`http/ws server listening on ${PORT}`));
