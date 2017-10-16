
const debug = require('debug')('rerpc');

class Rerpc {
  constructor(options = {}) {
    debug('Rerpc', options);
    this.registry = {};
    this.context = {};
    this.options = options;
    Object.assign(this, options);
  }

  register(descriptor) {
    Object.keys(descriptor).forEach((fn) => {
      debug('register', fn);
      this.registry[fn] = descriptor[fn];
    });
  }

  async invoke(fn, payload, context) {
    debug('invoke', fn, !!this.registry[fn], payload);
    if (!this.registry[fn]) {
      throw new Error('FunctionNotFound');
    }
    const result = await this.registry[fn].call(Object.assign({}, this.context, context), payload);
    debug('invoke', fn, result);
    return result;
  }

  processPayload(payload) {
    // @TODO convert date from string to Date
    return payload;
  }

  processError(error) {
    const { message, code, ...rest } = error;
    return { message, code, ...rest };
  }

  attachToExpress(app) {
    debug('attachToExpress');

    app.post('/rerpc', async (req, res, next) => {
      debug(req.query.fn, req.body);
      try {
        const fn = req.query.fn;
        const payload = this.processPayload(req.body);
        const result = await this.invoke(fn, payload, {
          transport: 'express',
          req,
          res,
          next,
        });
        res.json({ $result: result });
      } catch (error) {
        this.handleErrorOnExpress(error, req, res, next);
      }
    });
  }

  handleErrorOnExpress(error, req, res, next) {
    debug('error', error);
    res.status(error.status || 400).json({ $error: this.processError(error) });
  }

  attachToSocketIO(soc) {
    debug('attachToSocketIO');
    soc.on('rerpc', async (fn, payload, ack) => {
      try {
        payload = this.processPayload(payload);
        debug(fn, payload);
        const result = await this.invoke(fn, payload, {
          transport: 'socket.io',
          soc,
          ack,
        });
        ack({ $result: result });
      } catch (error) {
        this.handleErrorOnSocketIO(error, soc, ack);
      }
    });
  }

  handleErrorOnSocketIO(error, soc, ack) {
    debug('error', error);
    ack({ $error: this.processError(error) });
  }
}

module.exports = function (options) {
  return new Rerpc(options);
};

