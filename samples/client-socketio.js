const socket = require('socket.io-client')('http://localhost:5000/');

socket.emit('rerpc', 'hello', {
  name: 'World',
}, (err, result) => {
  console.log(err || result); // => "Hello World!"
  process.exit(0);
});
