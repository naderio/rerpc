const socket = require('socket.io-client')('http://localhost:5000/');

socket.emit('rerpc', 'hello', {
  name: 'World'
}, function (err, result) {
  console.log(result); // => "Hello World!"
});