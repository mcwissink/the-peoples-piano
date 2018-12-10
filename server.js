const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const express  = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const Filter = require('bad-words');
const filter = new Filter({ placeHolder: 'x'});

const APP_PATH = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const randomColor = () => {
    return Math.floor(Math.random()*16777215);
};

// Express server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(APP_PATH));
app.use('*', express.static(APP_PATH));

// Socket.io
const users = {};
io.on('connection', socket => {
  socket.on('join', name => {
    users[socket.id] = {
      name: name === null ? 'Beethoven' : filter.clean(name),
      id: socket.id,
      color: randomColor(),
    };
    // Send all the pianists that are connected
    socket.emit('users', Object.values(users));
    // Tell all the other users that a new one connected
    socket.broadcast.emit('user_connected', users[socket.id]);
  })
  socket.on('noteon', note => {
    socket.broadcast.emit('noteon', { note, id: socket.id });
  });
  socket.on('noteoff', note => {
    socket.broadcast.emit('noteoff', { note, id: socket.id });
  });
  socket.on('disconnect', () => {
    socket.broadcast.emit('user_disconnected', users[socket.id]);
    delete users[socket.id];
  });
});

http.listen(PORT, () => console.log(`http/ws server listening on ${PORT}`));
