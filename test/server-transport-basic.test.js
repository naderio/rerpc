const express = require('express');

const app = express();
app.use(express.json());
const http = require('http').Server(app);
app.io = require('socket.io')(http);

http.listen(5000);

const rerpc = require('../lib/server')();

rerpc.attachToExpress(app);
app.io.on('connect', soc => rerpc.attachToSocketIO(soc));

const test = require('tape');

const fetch = require('node-fetch');
const socketio = require('socket.io-client')('http://localhost:5000/');

const RPCPayload = payload => ({
  method: 'post',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

test('should fail invoke missing function over HTTP', async (t) => {
  t.plan(2);

  const response = await fetch('http://localhost:5000/rerpc?fn=hello404', RPCPayload({ name: 'World' }));
  t.equal(response.status, 400, 'should have status code 400');
  const result = await response.json();
  t.deepEqual(result, { $error: { message: 'FunctionNotFound' } }, 'should match error structure');
});

test('should fail invoke missing function over Socket.IO', async (t) => {
  t.plan(1);

  socketio.emit('rerpc', 'hello404', { name: 'World' }, (result) => {
    t.deepEqual(result, { $error: { message: 'FunctionNotFound' } }, 'should match error structure');
  });
});

async function hello({ name }) {
  return `Hello ${name}!`;
}

rerpc.register({ hello });

test('should invoke function over HTTP', async (t) => {
  t.plan(2);

  const response = await fetch('http://localhost:5000/rerpc?fn=hello', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, { $result: 'Hello World!' }, 'should match result structure');
});

test('should invoke function over Socket.IO', async (t) => {
  t.plan(1);

  socketio.emit('rerpc', 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, { $result: 'Hello World!' }, 'should match result structure');
  });
});

test.onFinish(() => {
  socketio.disconnect();
  http.close();
});
