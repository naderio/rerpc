const socketio = require('socket.io-client')('http://localhost:5000/');

socketio.emit('/rerpc', 'greet', { name: 'World' }, (result) => {
  console.log(result); // => { "$result": "Hello World!" }
  socketio.disconnect();
});
