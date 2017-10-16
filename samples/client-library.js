const socketio = require('socket.io-client')('http://localhost:5000/');

const rerpc = require('../lib/client')({ socketio });

(async () => {
  const result = await rerpc.invoke('hello', { name: 'World' });
  console.log(result); // => "Hello World!"

  // const result = await rerpc.fn.hello({ name: 'World' });
  // console.log(result); // => "Hello World!"
})().catch(console.error);
