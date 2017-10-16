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

test('should fail to invoke missing function over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $error: { message: 'FunctionNotFound' } };

  const response = await fetch('http://localhost:5000/rerpc?fn=hello404', RPCPayload({ name: 'World' }));
  t.equal(response.status, 400, 'should have status code 400');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match error structure');

  socketio.emit('rerpc', 'hello404', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match error structure');
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

async function helloObject({ name }) {
  return { message: `Hello ${name}!` };
}

rerpc.register({ helloObject });

test('should invoke function returning an object over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $result: { message: 'Hello World!' } };

  const response = await fetch('http://localhost:5000/rerpc?fn=helloObject', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match result structure');

  socketio.emit('rerpc', 'helloObject', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match result structure');
  });
});

async function helloArray({ name }) {
  return [`Hello ${name}!`];
}

rerpc.register({ helloArray });

test('should invoke function returning an array over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $result: ['Hello World!'] };

  const response = await fetch('http://localhost:5000/rerpc?fn=helloArray', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match result structure');

  socketio.emit('rerpc', 'helloArray', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match result structure');
  });
});

async function helloString({ name }) {
  return `Hello ${name}!`;
}

rerpc.register({ helloString });

test('should invoke function returning a string over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $result: 'Hello World!' };

  const response = await fetch('http://localhost:5000/rerpc?fn=helloString', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match result structure');

  socketio.emit('rerpc', 'helloString', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match result structure');
  });
});

async function helloNumber() {
  return 0;
}

rerpc.register({ helloNumber });

test('should invoke function returning a number over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $result: 0 };

  const response = await fetch('http://localhost:5000/rerpc?fn=helloNumber', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match result structure');

  socketio.emit('rerpc', 'helloNumber', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match result structure');
  });
});

async function helloBoolean() {
  return false;
}

rerpc.register({ helloBoolean });

test('should invoke function returning a booelan over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $result: false };

  const response = await fetch('http://localhost:5000/rerpc?fn=helloBoolean', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match result structure');

  socketio.emit('rerpc', 'helloBoolean', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match result structure');
  });
});

const DATE = new Date();

async function helloDate() {
  return DATE;
}

rerpc.register({ helloDate });

test('should invoke function returning a date over HTTP and Socket.IO', async (t) => {
  t.plan(3);

  const expectedResult = { $result: DATE.toJSON() };

  const response = await fetch('http://localhost:5000/rerpc?fn=helloDate', RPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'should have status code 200');
  const result = await response.json();
  t.deepEqual(result, expectedResult, 'should match result structure');

  socketio.emit('rerpc', 'helloDate', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'should match result structure');
  });
});

test.onFinish(() => {
  socketio.disconnect();
  http.close();
});
