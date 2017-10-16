
const debug = require('debug')('rerpc');

class Rerpc {
  constructor(options = {}) {
    debug('Rerpc', options);
    this.options = options;
    this.registry = {};
    this.context = options.context || {};
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

  prepareError(error) {
    const { message, code, ...rest } = error;
    return { message, code, ...rest };
  }

  attachToExpress(app) {
    debug('attachToExpress');

    app.post('/rerpc', async (req, res, next) => {
      debug(req.query.fn, req.body);
      try {
        const result = await this.invoke(req.query.fn, req.body, {
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
    res.status(error.status || 400).json({ $error: this.prepareError(error) });
  }

  attachToSocketIO(soc) {
    debug('attachToSocketIO');
    soc.on('rerpc', async (fn, payload, ack) => {
      try {
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
    ack({ $error: this.prepareError(error) });
  }
}

module.exports = function (options) {
  return new Rerpc(options);
};

