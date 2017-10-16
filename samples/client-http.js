const fetch = require('node-fetch');

(async () => {
  const RPCPayload = payload => ({
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const response = await fetch('http://localhost:5000/rerpc?fn=hello', RPCPayload({ name: 'World' }));
  const result = await response.json();
  console.log(result); // => "Hello World!"
})().catch(console.error);
