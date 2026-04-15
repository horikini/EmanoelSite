
import fetch from 'node-fetch';

async function testCreate() {
  const response = await fetch('http://localhost:3000/api/criar-atleta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Atleta Teste Real',
      email: 'atletareal@teste.com',
      phone: '11999999999'
    }),
  });

  const result = await response.json();
  console.log(result);
}

testCreate();
