const rerpc = require('rerpc/client')('http://localhost:5000');

(async() => {

  let result;

  result = await rerpc.invoke('hello', {
    name: 'World'
  });
  console.log(result); // => "Hello World!"

  result = await rerpc.fn.hello({
    name: 'World'
  }); // ES2015 Proxy to the rescue
  console.log(result); // => "Hello World!"

})();