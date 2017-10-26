Prefix Customazation
====================

The `/rerpc` prefix in HTTP path and Socket.IO event handlers is customisable and not required.

## Custom Prefix

Change prefix from `/rerpc` to `/rpc` for example.

### Server

```javascript
const rerpc = require('rerpc')({
  prefix: '/rpc';
});
```
### Client

#### Using dedicated library

```javascript
const rerpc = require('rerpc/client')({
  prefix: '/rpc';
  // ...
});
```

#### Using `fetch`

```javascript
await fetch('http://localhost:5000/rpc/greet', { ... });
```

#### Using Socket.IO
```javascript
socketio.emit('/rpc', 'greet', { name: 'World' }, (result => { ... });
```
## Without Prefix

Change prefix to be empty.

### Server

```javascript
const rerpc = require('rerpc')({
  prefix: '';
});
```
### Client

#### Using dedicated library

```javascript
const rerpc = require('rerpc/client')({
  prefix: '';
  // ...
});
```

#### Using `fetch`

```javascript
await fetch('http://localhost:5000/greet', { ... });
```

#### Using Socket.IO

```javascript
socketio.emit('greet', { name: 'World' }, (result => { ... });
```
