
reRPC [WIP]
===========

`reRPC` is an opinionated take on RPC system intended for usage from frontal apps with dedicated client library, HTTP request or Socket.IO.

`reRPC` enable you to define an async Node.js function and to call it remotely as if you never left the server. 

## Status

Active development.

## Goals

- `Promise`-based
- make use of `async/await`
- simplify invocation interface with ES2015 `Proxy`
- stay simple:
  - do not create and manage transport connection, even in frontend
  - no middleware, authentication, ...
  - delegate customisation code to transport (Express and/or Socket.IO)

## Code Sample

### Server:

```javascript

// initiate
const rerpc = require('rerpc')({ /* options here */ });

// define function
async function hello({ name }) {
  return `Hello ${name}!`;
}

// register function
rerpc.register({ hello });

// attach to Express app our route
rerpc.attachToExpress(app);

// attach to Socket.IO instance
socketio.on('connect', soc => rerpc.attachToSocketIO(soc));
```

### Client using library

```javascript
const socketio = require('socket.io-client')('http://localhost:5000/');
const rerpc = require('../lib/client')({ socketio });

(async () => {
  const result = await rerpc.fn.hello({ name: 'World' });
  console.log(result); // => "Hello World!"
})();
```

### Client using HTTP request via `fetch`

```javascript
(async () => {
  const RPCPayload = payload => ({
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const response = await fetch('http://localhost:5000/rerpc?fn=hello', RPCPayload({ name: 'World' }));
  const result = await response.json();
  console.log(result); // => "Hello World!"
})();
```


### Client using Socket.IO

```javascript
const socketio = require('socket.io-client')('http://localhost:5000/');

socketio.emit('rerpc', 'hello', { name: 'World' }, (err, result) => {
  console.log(result); // => "Hello World!"
});
```
