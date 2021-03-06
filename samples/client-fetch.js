require('isomorphic-fetch');

(async () => {
  const FetchPayload = payload => ({
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });

  const response = await fetch('http://localhost:5000/rerpc/greet', FetchPayload({ name: 'World' }));
  const result = await response.json();
  console.log(result); // => { "$result": "Hello World!" }
})().catch(console.error);
