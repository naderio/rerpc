/* global fetch Headers */

const express = require('express');

const app = express();
app.use(express.json());
const http = require('http').Server(app);
app.io = require('socket.io')(http);

const PORT = 5001;

http.listen(PORT);

const ENDPOINT = `http://localhost:${PORT}`;
const PREFIX = '/rerpc';

const rerpc = require('../lib/server')({});

rerpc.attachToExpress(app);
app.io.on('connect', soc => rerpc.attachToSocketIO(soc));

const test = require('tape');

require('isomorphic-fetch');
const rerpcOverHttp = require('../lib/client')({
  transport: 'http',
  transportHandler: ENDPOINT,
});
const socketio = require('socket.io-client')(ENDPOINT);
const rerpcOverSocketIO = require('../lib/client')({
  transport: 'socket.io',
  transportHandler: socketio,
});

const ReRPCPayload = payload => ({
  method: 'post',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload),
});

test('should fail to invoke missing function', async (t) => {
  t.plan(7);

  let result;

  const expectedResult = { $error: { message: 'FunctionNotFound' } };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello404`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 400, 'http request should have status code 400');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match error structure');

  socketio.emit(PREFIX, 'hello404', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match error structure');
  });

  try {
    result = await rerpcOverHttp.invoke('hello404', { name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message }, expectedResult.$error, 'client library over http should match error structure');
  }

  try {
    result = await rerpcOverSocketIO.invoke('hello404', { name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message }, expectedResult.$error, 'client library over socket.io should match error structure');
  }

  try {
    result = await rerpcOverHttp.fn.hello404({ name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message }, expectedResult.$error, 'client library over http should match error structure');
  }

  try {
    result = await rerpcOverSocketIO.fn.hello404({ name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message }, expectedResult.$error, 'client library over socket.io should match error structure');
  }
});

test('should invoke function throwing an error', async (t) => {
  t.plan(7);

  rerpc.register({
    hello: async () => {
      const error = new Error('You have a custom error!');
      error.code = 'CustomError';
      throw error;
    },
  });

  let result;

  const expectedResult = { $error: { code: 'CustomError', message: 'You have a custom error!' } };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 400, 'http request should have status code 400');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match error structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match error structure');
  });

  try {
    result = await rerpcOverHttp.invoke('hello', { name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message, ...error }, expectedResult.$error, 'client library over http should match error structure');
  }

  try {
    result = await rerpcOverSocketIO.invoke('hello', { name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message, ...error }, expectedResult.$error, 'client library over socket.io should match error structure');
  }

  try {
    result = await rerpcOverHttp.fn.hello({ name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message, ...error }, expectedResult.$error, 'client library over http should match error structure');
  }

  try {
    result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  } catch (error) {
    t.deepEqual({ message: error.message, ...error }, expectedResult.$error, 'client library over socket.io should match error structure');
  }
});

test('should invoke function returning an object', async (t) => {
  t.plan(5);

  rerpc.register({ hello: async ({ name }) => ({ message: `Hello ${name}!` }) });

  let result;

  const expectedResult = { $result: { message: 'Hello World!' } };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'http request should have status code 200');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match result structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match result structure');
  });

  result = await rerpcOverHttp.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over http should match result structure');

  result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over socket.io should match result structure');
});

test('should invoke function returning an array', async (t) => {
  t.plan(5);

  rerpc.register({ hello: async ({ name }) => [`Hello ${name}!`] });

  let result;

  const expectedResult = { $result: ['Hello World!'] };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'http request should have status code 200');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match result structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match result structure');
  });

  result = await rerpcOverHttp.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over http should match result structure');

  result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over socket.io should match result structure');
});

test('should invoke function returning a string', async (t) => {
  t.plan(5);

  rerpc.register({ hello: async ({ name }) => `Hello ${name}!` });

  let result;

  const expectedResult = { $result: 'Hello World!' };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'http request should have status code 200');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match result structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match result structure');
  });

  result = await rerpcOverHttp.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over http should match result structure');

  result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over socket.io should match result structure');
});

test('should invoke function returning a number', async (t) => {
  t.plan(5);

  rerpc.register({ hello: async () => 0 });

  let result;

  const expectedResult = { $result: 0 };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'http request should have status code 200');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match result structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match result structure');
  });

  result = await rerpcOverHttp.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over http should match result structure');

  result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over socket.io should match result structure');
});

test('should invoke function returning a boolean', async (t) => {
  t.plan(5);

  rerpc.register({ hello: async () => false });

  let result;

  const expectedResult = { $result: false };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'http request should have status code 200');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match result structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match result structure');
  });

  result = await rerpcOverHttp.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over http should match result structure');

  result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over socket.io should match result structure');
});

test('should invoke function returning a date', async (t) => {
  t.plan(5);

  const DATE = new Date();

  rerpc.register({ hello: async () => DATE });

  let result;

  const expectedResult = { $result: DATE.toJSON() };

  const response = await fetch(`${ENDPOINT}${PREFIX}/hello`, ReRPCPayload({ name: 'World' }));
  t.equal(response.status, 200, 'http request should have status code 200');
  result = await response.json();
  t.deepEqual(result, expectedResult, 'http request should match result structure');

  socketio.emit(PREFIX, 'hello', { name: 'World' }, (result) => {
    t.deepEqual(result, expectedResult, 'socket.io event should match result structure');
  });

  result = await rerpcOverHttp.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over http should match result structure');

  result = await rerpcOverSocketIO.fn.hello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result, 'client library over socket.io should match result structure');
});

test('should invoke function with normal name in multiple ways', async (t) => {
  t.plan(4);

  rerpc.register({ sayHello: async ({ name }) => ({ message: `Hello ${name}!` }) });

  let result;

  const expectedResult = { $result: { message: 'Hello World!' } };

  result = await rerpcOverHttp.fn.sayHello({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);

  result = await rerpcOverHttp.fn['/sayHello']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);

  result = await rerpcOverHttp.fn['sayHello/']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);

  result = await rerpcOverHttp.fn['/sayHello/']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);
});

test('should invoke function with path name in multiple ways', async (t) => {
  t.plan(4);

  rerpc.register({ '/greeting/hello': async ({ name }) => ({ message: `Hello ${name}!` }) });

  let result;

  const expectedResult = { $result: { message: 'Hello World!' } };

  result = await rerpcOverHttp.fn['/greeting/hello']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);

  result = await rerpcOverHttp.fn['/greeting/hello']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);

  result = await rerpcOverHttp.fn['greeting/hello/']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);

  result = await rerpcOverHttp.fn['/greeting/hello/']({ name: 'World' });
  t.deepEqual(result, expectedResult.$result);
});

test.onFinish(() => {
  socketio.disconnect();
  http.close();
});
