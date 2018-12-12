const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const express  = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient
var randomColor = require('randomcolor');
var assert = require('assert');

// Chat filter library
const Filter = require('bad-words');
const filter = new Filter({ placeHolder: 'x'});

const APP_PATH = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const makeRandomColor = () => {
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
		if (name === null) {
			return;
		}
		// update if name in DB or insert if not
		db.collection("piano_users").updateOne (
			{ name : name },
			{ $setOnInsert: { name: name, upvotes: 0} },
			//create field but dont set it?
			{ upsert : true }
		)

		db.collection("piano_users").findOne( { name : name } ).then((user) => {

			users[socket.id] = {
				name: user.name,
				color: randomColor({ luminosity: 'light' }),
				upvotes: user.upvotes,
				id: socket.id,
			};

			// Send all the pianists that are connected
			socket.emit('users', Object.values(users);
			// Tell all the other users that a new one connected
			socket.broadcast.emit('user_connected', users[socket.id]);
		});
	})
	socket.on('upvote', id => {
		const name = users[id].name;
		db.collection("piano_users").updateOne (
			{ name : name },
			{ $inc : { upvotes : 1 } }
		)
		users[id].upvotes += 1;
		socket.emit('users', Object.values(users));
		socket.broadcast.emit('users', Object.values(users));
	});
	socket.on('downvote', id => {
		const name = users[id].name;
		db.collection("piano_users").updateOne (
			{ name : name },
			{ $inc : { upvotes : -1 } }
		)
		users[id].upvotes -= 1;
		socket.emit('users', Object.values(users));
		socket.broadcast.emit('users', Object.values(users));
	});
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

// From the mongo lab...
var mongoURL = 'mongodb://cs336:' + process.env.MONGO_PASSWORD + '@ds255253.mlab.com:55253/cs336';
MongoClient.connect(mongoURL, function(err, dbConnection) {
	if (err) {
		throw err;
	}
	db = dbConnection;

	app.listen(app.get('port'), function() {
		console.log('Server started: http://localhost:' + app.get('port') + '/');
	});
});

http.listen(PORT, () => console.log(`http/ws server listening on ${app.get('port')}`));
