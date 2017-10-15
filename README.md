
reRPC
=====

`reRPC` is an opinionated take on RPC system intended for usage from frontal apps with dedicated client library, HTTP request or Socket.IO.

## Goals

- `Promise`-based
- to consume using `async/await`
- makes use of `Proxy`

## Code Sample

### Server:

```javascript
// initiate
const rerpc = require('rerpc')({
  // options here
});

async function hello({name}) {
  // this.soc?
  // this.req?
  return `Hello ${name}!`;
}

// register
rerpc.register('hello', hello);

// multiple
rerpc.register({
  hello,
});

// attach to HTTP server
rerpc.attach(http);

// attach to Socket.IO instance
rerpc.attach(soc);

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

### Client using HTTP request

```javascript

(async () => {

  let result;

  let Payload = (payload) => ({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  const response = await fetch('http://localhost:5000/rerpc/hello', Payload({name: 'World'}));
  result = await response.json();
  console.log(result); // => "Hello World!"

  const response = await fetch('http://localhost:5000/rerpc/?fn=hello', Payload({name: 'World'}));
  result = await response.json();
  console.log(result); // => "Hello World!"

})();

```


### Client using Socket.IO

```javascript

const socket = require('socket.io-client')('http://localhost:5000/rerpc');

socket.emit('fn.hello', {name: 'World'}, function (err, result) {
    console.log(result); // => "Hello World!"
});
  
```

