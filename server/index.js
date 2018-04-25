const express = require('express');
const app = express();
const server = require('http').Server(app);
const mongoose = require('mongoose');
const User = require('./models/user');
const Skin = require('./models/skin');
const skins = require('./skins.json');
const bodyParser = require('body-parser');
const {
  MONGO_URL,
  PORT,
  SOCKET_SERVER_PATH
} = require('./credentials')
const rooms = require('./rooms');
const controllers = require('./controllers');
const poolProxySocket = require('./mining/pool-proxy-socket');

mongoose.connect(MONGO_URL);
const db = mongoose.connection;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Start web socket server ontop of http server
const io = require('socket.io')(server, {
  path: SOCKET_SERVER_PATH,
  serveClient: false
});

app.use(express.static('dist'));
server.listen(PORT);

rooms.setRooms(io);
// Start mining proxy
poolProxySocket(io);

controllers.attachRouteControllers(app);
io.on('connect', socket => {
  rooms.setConnections(socket);
});

// Insert skins into database.
skins.forEach(skin =>
  new Skin(skin)
    .save()
    .catch((err) => {
      if (err.name !== 'BulkWriteError') {
        console.error(err);
        return;
      }
      // Don't worry about it if it's already inserted.
    }))
