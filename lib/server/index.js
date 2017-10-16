
const debug = require('debug')('rerpc');

class Handler {
  constructor(options) {
    debug('register', options);
    this.registry = {};
  }

  register(descriptor) {
    debug('register', Object.keys(descriptor));
    Object.keys(descriptor).forEach((fn) => {
      this.registry[fn] = descriptor[fn];
    });
  }

  async invoke(fn, payload, context) {
    debug('invoke', fn, !!this.registry[fn], payload);
    if (!this.registry[fn]) {
      throw new Error('FunctionNotFound');
    }
    const result = await this.registry[fn].call(context, payload);
    debug('invoke', fn, result);
    return result;
  }

  prepareError(error) {
    const { message, code, ...rest } = error;
    return { message, code, ...rest };
  }

  attachToExpress(app) {
    debug('attachToExpress');

    app.post('/rerpc', async (req, res) => {
      debug(req.query.fn, req.body);
      try {
        const result = await this.invoke(req.query.fn, req.body, { transport: 'http', req, res });
        res.json(result);
      } catch (error) {
        this.handleErrorOnExpress(error, req, res);
      }
    });
  }

  handleErrorOnExpress(error, req, res) {
    debug('error', error);
    res.status(400).json(this.prepareError(error));
  }

  attachToSocketIO(soc) {
    debug('attachToSocketIO');
    soc.on('rerpc', async (fn, payload, ack) => {
      try {
        debug(fn, payload);
        const result = await this.invoke(fn, payload, { transport: 'socket.io', soc, ack });
        ack(null, result);
      } catch (error) {
        this.handleErrorOnSocketIO(error, soc, ack);
      }
    });
  }

  handleErrorOnSocketIO(error, soc, ack) {
    debug('error', error);
    ack(this.prepareError(error));
  }
}

module.exports = function (options) {
  return new Handler(options);
};

