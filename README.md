
reRPC [WIP]
===========

`reRPC` is an opinionated take on RPC system intended for usage from frontal apps with dedicated client library, HTTP request or Socket.IO.

## Status

Active development.

## Goals

- `Promise`-based
- make use of `async/await`
- simplify invocation interface with ES2015 `Proxy`
- keep it simple:
  - no middleware
  - do not handle authentication
  - delegate customisation code to connection handler (Express and/or Socket.IO)

## Code Sample

### Server:

```javascript
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
```

### Client using library

```javascript
const rerpc = require('rerpc/client')('http://localhost:5000');

(async() => {

  let result;

  result = await rerpc.invoke('hello', {
    name: 'World'
  });
  console.log(result); // => "Hello World!"

  result = await rerpc.fn.hello({
    name: 'World'
  }); // ES2015 Proxy to the rescue
  console.log(result); // => "Hello World!"

})();
```

### Client using HTTP request via `fetch`

```javascript
(async() => {

  let RPCPayload = (payload) => ({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const response = await fetch('http://localhost:5000/rerpc?fn=hello', RPCPayload({
    name: 'World'
  }));
  let result = await response.json();
  console.log(result); // => "Hello World!"

})();
```


### Client using Socket.IO

```javascript
const socket = require('socket.io-client')('http://localhost:5000/');

socket.emit('rerpc', 'hello', {
  name: 'World'
}, function (err, result) {
  console.log(result); // => "Hello World!"
});
```