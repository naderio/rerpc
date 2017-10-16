require('isomorphic-fetch');

const socketio = require('socket.io-client')('http://localhost:5000/');

// const rerpc = require('rerpc/client')({
//   transport: 'socket.io',
//   transportHandler: socketio,
// });

const rerpc = require('rerpc/client')({
  transport: 'http',
  transportHandler: 'http://localhost:5000',
});

// const rerpc = require('rerpc/client')({
//   transport: 'http',
//   transportHandler: async (fn, payload) => fetch(`http://localhost:5000/rerpc?fn=${fn}`, {
//     method: 'post',
//     headers: new Headers({ 'Content-Type': 'application/json' }),
//     body: JSON.stringify(payload),
//   }),
// });

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
