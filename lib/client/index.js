
/* global fetch Headers */

const debug = require('debug')('rerpc-client');

const FetchPayload = payload => ({
  method: 'post',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload),
});

const HttpTransportHandler = (endpoint, prefix) => async (fn, payload) => (await fetch(`${endpoint}${prefix}/${fn}`, FetchPayload(payload))).json();

const SocketioTransportHandler = (soc, prefix) => async (fn, payload) => new Promise((resolve) => {
  soc.emit(...(prefix ? [prefix] : []), fn, payload, resolve);
});


class RerpcClient {
  constructor(options = {}) {
    debug('RerpcClient', options);
    this.fn = new Proxy({}, {
      get: (target, name) => async payload => this.invoke(name, payload),
    });
    this.options = options;
    this.prefix = '/rerpc';
    this.transport = 'http';
    Object.assign(this, options);
    this.prefix = this.prefix || '';
    if (this.transport === 'http' && typeof this.transportHandler === 'string') {
      this.transportHandler = HttpTransportHandler(this.transportHandler, this.prefix);
    } else if (this.transport === 'socket.io') {
      this.transportHandler = SocketioTransportHandler(this.transportHandler, this.prefix);
    }
  }

  async invoke(fn, payload) {
    debug('invoke', fn, payload);
    const result = await this.remoteInvoke(fn, payload);
    debug('invoke', fn, result);
    if (result.$error) {
      const error = new Error(result.$error.message);
      Object.assign(error, result.$error);
      throw error;
    }
    return this.processPayload(result.$result);
  }

  async remoteInvoke(fn, payload) {

    if (this.transport === 'http' || this.transport === 'socket.io') {
      return this.transportHandler(fn, payload);
    }

    throw new Error('TransportNotFound');
  }

  /* eslint-disable class-methods-use-this */
  processPayload(payload) {
    // @TODO convert date from string to Date
    return payload;
  }
  /* eslint-enable class-methods-use-this */
}

module.exports = options => new RerpcClient(options);

exports.RerpcClient = RerpcClient;

exports.HttpTransportHandler = HttpTransportHandler;

exports.SocketioTransportHandler = SocketioTransportHandler;

exports.FetchPayload = FetchPayload;
