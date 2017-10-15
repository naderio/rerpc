
reRPC [WIP]
===========

`reRPC` is an opinionated take on RPC system intended for usage from frontal apps with dedicated client library, HTTP request or Socket.IO.

## Goals

- `Promise`-based
- consume with `async/await`
- simplify invocation interface with ES2015 `Proxy`
- keep it simple:
  - no middleware
  - do not handle authentication
  - delegate customisation code to connection handler (Express and/or Socket.IO)

## Code Sample

### Server:

```javascript
// initiate
const rerpc = require('rerpc')({
  // options here
});

async function hello({name}) {
  // maybe use this.soc here
  // maube use this.req here
  return `Hello ${name}!`;
}

// register
rerpc.register('hello', hello);

// register multiple functions
rerpc.register({
  hello,
});

// attach to HTTP server
rerpc.attach(http); // attaches to /rerpc

// attach to Socket.IO instance
rerpc.attach(soc); // attaches to /rerpc

```

### Client using library

```javascript

const rerpc = require('rerpc-client')('http://localhost:5000');

(async () => {

  let result;

  result = await rerpc.invoke('hello', {name: 'World'});
  console.log(result); // => "Hello World!"

  result = await rerpc.fn.hello({name: 'World'}); // By mean of ES2015 Proxy
  console.log(result); // => "Hello World!"

})();
```

### Client using HTTP request via `fetch`

```javascript

(async () => {

  let RPCPayload = (payload) => ({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const response = await fetch('http://localhost:5000/rerpc?fn=hello', RPCPayload({name: 'World'}));
  let result = await response.json();
  console.log(result); // => "Hello World!"

})();

```


### Client using Socket.IO

Two possibilities:

#### Connect to attached Socket.IO:

```javascript

const socket = require('socket.io-client')('http://localhost:5000/');

socket.emit('rerpc', 'hello', {name: 'World'}, function (err, result) {
    console.log(result); // => "Hello World!"
});
  
```

#### Connect to dedicated Socket.IO instance:

```javascript

const socket = require('socket.io-client')('http://localhost:5000/rerpc');

socket.emit('hello', {name: 'World'}, function (err, result) {
    console.log(result); // => "Hello World!"
});
  
```
