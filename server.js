const WebSocket = require('ws');
const WSServer = WebSocket.Server;
const server = require('http').createServer();
const app = require('./http-server');
const PORT = process.env.PORT || 3000
// Create web socket server on top of a regular http server
const wss = new WSServer({

  server: server
});

// Also mount the app here
server.on('request', app);

wss.on('connection', ws => {

  ws.on('message', message => {
    // Broadcast to all other clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`http/ws server listening on ${PORT}`);
});
