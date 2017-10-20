
/* global fetch Headers */

const debug = require('debug')('rerpc-client');

const httpTransportHandler = endpoint => async (fn, payload) => fetch(`${endpoint}/rerpc/${fn}`, {
  method: 'post',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload),
});

class RerpcClient {
  constructor(options = {}) {
    debug('RerpcClient', options);
    this.fn = new Proxy({}, {
      get: (target, name) => async payload => this.invoke(name, payload),
    });
    this.options = options;
    this.transport = 'http';
    Object.assign(this, options);
    if (this.transport === 'http' && typeof this.transportHandler === 'string') {
      this.transportHandler = httpTransportHandler(this.transportHandler);
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
    if (this.transport === 'http') {
      const response = await this.transportHandler(fn, payload);
      return response.json();
    }

    if (this.transport === 'socket.io') {
      return new Promise((resolve) => {
        this.transportHandler.emit('rerpc', fn, payload, resolve);
      });
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
