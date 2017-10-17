
reRPC
=====

`reRPC` is an opinionated take on RPC system intended for usage from frontal apps in a multitude of ways.

## Status

![Status](https://img.shields.io/badge/status-production--ready-green.svg)
[![npm](https://img.shields.io/npm/l/rerpc.svg?maxAge=1000)](https://github.com/naderio/rerpc/blob/master/LICENSE.md)
[![node](https://img.shields.io/node/v/rerpc.svg?maxAge=1000)](https://www.npmjs.com/package/rerpc)
[![npm](https://img.shields.io/npm/v/rerpc.svg?maxAge=1000)](https://www.npmjs.com/package/rerpc)
[![dependency Status](https://img.shields.io/david/naderio/rerpc.svg?maxAge=1000)](https://david-dm.org/naderio/rerpc)
[![devDependency Status](https://img.shields.io/david/dev/naderio/rerpc.svg?maxAge=1000)](https://david-dm.org/naderio/rerpc)
[![devDependency Status](https://img.shields.io/david/peer/naderio/rerpc.svg?maxAge=1000)](https://david-dm.org/naderio/rerpc)
[![Build Status](https://travis-ci.org/naderio/rerpc.svg?branch=master)](https://travis-ci.org/naderio/rerpc)
[![npm](https://img.shields.io/npm/dt/rerpc.svg?maxAge=1000)](https://www.npmjs.com/package/rerpc)


This library is production-ready.

Please refer to [roadmap](https://github.com/naderio/rerpc/issues/1) for more information.

## Description

`reRPC` enable you to do the following:
- define an async Node.js function (`lib.doSomething = async (payload) => { ... }`)
- call the defined function from client by mean of:
  - client library (`result = await lib.doSomething(payload)`)
  - HTTP request (`POST /rerpc?fn=doSomething` with JSON body)
  - Socket.IO event (`socketio.emit('rerpc', 'doSomething', payload, (result) => { ... }`)

`reRPC` exposes defined functions by attaching itself to:
- `/rerpc` route on an [Express](https://expressjs.com/) app or route instance  
- `rerpc` event on a [Socket.IO](https://socket.io/) instance

## Goals

- `Promise`-based
- make use of `async/await`
- simplify invocation interface with ES2015 `Proxy`
- stay simple:
  - do not create and manage transport connection, even in frontend
  - no middleware, authentication, ...
  - delegate customisation code to transport (Express and/or Socket.IO)
- stay flexible:
  - enable function to access transport layer
  - enable function context augmentation
  - enable custom payload processing
  - enable custom error handling

## Requirements

`reRPC` makes use of a number of ES2015+ features, most notably `async/await` and `Proxy`. Therefore:

- Node v8+
- Transpiler for browser code

## Code Samples

Please refer to [`samples` folder](./samples) for more examples.

### Server

```javascript
const express = require('express');
const app = express();
app.use(express.json());
const http = require('http').Server(app);
app.io = require('socket.io')(http);
http.listen(5000);

// initiate
const rerpc = require('rerpc')();

// define function
async function hello({ name }) {
  return `Hello ${name}!`;
}

// register function
rerpc.register({ hello });

// attach to Express app our route, creates '/rerpc' route
rerpc.attachToExpress(app);

// attach to Socket.IO instance, creates 'rerpc' event
app.io.on('connect', soc => rerpc.attachToSocketIO(soc));
```

### Client

#### Using dedicated library

```javascript

const rerpc = require('rerpc/client')({
  transport: 'http',
  transportHandler: 'http://localhost:5000',
});

// or

const socketio = require('socket.io-client')('http://localhost:5000/');

const rerpc = require('rerpc/client')({
  transport: 'socket.io',
  transportHandler: socketio,
});

// then 

(async () => {
  try {
    const result = await rerpc.fn.hello({ name: 'World' });
    console.log(result); // => "Hello World!"
  } catch(error) {
    console.error(error);
  }
})();
```

#### Using `CURL`

```bash
curl -X POST 'http://localhost:5000/rerpc?fn=hello' -H 'content-type: application/json' -d '{"name": "World"}' # => { "$result": "Hello World!" } OR {" $error": { ... } }
```

#### Using HTTP request via `fetch`

```javascript
(async () => {
  const response = await fetch('http://localhost:5000/rerpc?fn=hello', {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name: 'World' }),
  });
  const result = await response.json();
  console.log(result); // => { "$result": "Hello World!" } OR { "$error:" { ... } }
})();
```

#### Using Socket.IO

```javascript
const socketio = require('socket.io-client')('http://localhost:5000/');

socketio.emit('rerpc', 'hello', { name: 'World' }, (result => {
  console.log(result); // => { "$result": "Hello World!" } OR { "$error:" { ... } }
});
```
