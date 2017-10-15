(async() => {

  let RPCPayload = (payload) => ({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const response = await fetch('http://localhost:5000/rerpc?fn=hello', RPCPayload({
    name: 'World'
  }));
  let result = await response.json();
  console.log(result); // => "Hello World!"

})();