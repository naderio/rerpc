const express = require('express');

const app = express();
app.use(express.json());
const http = require('http').Server(app);
app.io = require('socket.io')(http);

http.listen(5000);

// initiate

const rerpc = require('rerpc')({ /* options here */ });

// augment function execution context with useful abstraction

Object.assign(rerpc.context, {
  isAuthenticated() {
    return this.transport === 'socket.io' ? !!this.soc.user : !!this.req.user;
  },
});

// customize error handling

const MESSAGES = {
  Unauthenticated: 'Please login to receive an authentic greeting',
};

rerpc.processError = (error) => {
  const newError = {};

  Object.assign(newError, error);
  newError.code = error.code || error.message;
  newError.message = MESSAGES[newError.code] || error.message;

  newError.status = 400;
  if (newError.code === 'Unauthenticated') {
    newError.status = 401;
  }
  return newError;
};

// define functions
async function hello(payload) {
  // console.log('hello', Object.keys(this), payload);
  return `Hello ${payload.name}!`;
}

async function helloAuthenticated(payload) {
  if (!this.isAuthenticated()) {
    throw new Error('Unauthenticated');
  }
  return `Hello authenticated ${payload.name}!`;
}

// register function
rerpc.register({
  hello,
  helloAuthenticated,
});

// attach to Express app our route, creates '/rerpc' route
rerpc.attachToExpress(app);

// attach to Socket.IO instance, creates 'rerpc' event
app.io.on('connect', soc => rerpc.attachToSocketIO(soc));

