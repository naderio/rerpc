
const debug = require('debug')('rerpc-client');

const httpTransportHandler = async (fn, payload) => fetch(`http://localhost:5000/rerpc?fn=${fn}`, {
  method: 'post',
  headers: new Headers({ 'Content-Type': 'application/json' }),
  body: JSON.stringify(payload),
});

class RerpcClient {
  constructor(options = {}) {
    debug('RerpcClient', options);
    this.fn = new Proxy({}, {
      get: (target, name) => async paylaod => this.invoke(name, paylaod),
    });
    this.options = options;
    this.transport = 'http';
    this.transportHandler = httpTransportHandler;
    Object.assign(this, options);
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
      return await new Promise((resolve, reject) => {
        this.transportHandler.emit('rerpc', fn, payload, resolve);
      });
    }

    throw new Error('TransportNotFound');
  }

  processPayload(payload) {
    // @TODO convert date from string to Date
    return payload;
  }
}

module.exports = function (options) {
  return new RerpcClient(options);
};
