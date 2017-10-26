Usage
=====

### Server

```javascript
const express = require('express');
const app = express();
app.use(express.json());
const http = require('http').Server(app);
app.io = require('socket.io')(http);
http.listen(5000);

// initiate
const rerpc = require('rerpc')({});

// define function
async function greet({ name }) {
  return `Hello ${name}!`;
}

// register function
rerpc.register({ greet });

// attach to Express app our route, creates '/rerpc' route
rerpc.attachToExpress(app);

// attach to Socket.IO instance, creates '/rerpc' event
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
    const result = await rerpc.fn.greet({ name: 'World' });
    console.log(result); // => "Hello World!"
  } catch(error) {
    console.error(error);
  }
})();
```

#### Using `CURL`

```bash
curl -X POST 'http://localhost:5000/rerpc/greet' -H 'Content-Type: application/json' -d '{"name": "World"}'
# => { "$result": "Hello World!" } OR {" $error": { ... } }
```

#### Using `fetch`

```javascript
(async () => {
  const response = await fetch('http://localhost:5000/rerpc/greet', {
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

socketio.emit('/rerpc', 'greet', { name: 'World' }, (result => {
  console.log(result); // => { "$result": "Hello World!" } OR { "$error:" { ... } }
});
```
