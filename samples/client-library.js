require('isomorphic-fetch');

const socketio = require('socket.io-client')('http://localhost:5000/');

const rerpc = require('rerpc/client')({
  // transport: 'socket.io',
  // transportHandler: socketio,
});

(async () => {
  try {
    const result = await rerpc.fn.hello({ name: 'World' });
    console.log(result); // => "Hello World!"
  } catch (error) {
    console.error(error);
  }

  try {
    const result = await rerpc.fn.helloAuthenticated({ name: 'World' });
    console.log(result); // => "Hello World!"
  } catch (error) {
    console.error(error);
  }

  socketio.disconnect();
})();
