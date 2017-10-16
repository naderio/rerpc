const express = require('express');

const app = express();
app.use(express.json());
const http = require('http').Server(app);
app.io = require('socket.io')(http);

http.listen(5000);

// initiate
const rerpc = require('../lib/server')({
  // options here
});

// define function
async function hello(payload) {
  console.log('hello', Object.keys(this), payload);
  return `Hello ${payload.name}!`;
}

// register function
rerpc.register({ hello });

// attach to Express app our route, creates '/rerpc' route
rerpc.attachToExpress(app);

// attach to Socket.IO instance, creates 'rerpc' event
app.io.on('connect', soc => rerpc.attachToSocketIO(soc));

