const app = require('express')();
const http = require('http').Server(app);
const socketio = require('socket.io')(http);

http.listen(5000);

// initiate
const rerpc = require('rerpc')({
  // options here
});

// define function
async function hello({
  name,
}) {
  return `Hello ${name}!`;
}

// register function
rerpc.register({
  hello,
  sayHello: hello, // alias
});

// attach to HTTP server
rerpc.attach(http);

// attach to Socket.IO instance
rerpc.attach(socketio);
