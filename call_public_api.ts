
import fetch from 'node-fetch';

async function callPublicApi() {
  const url = 'https://ais-dev-m6u3lbvnyof2dytbp7wz7z-497165885545.us-east1.run.app/api/criar-atleta';
  console.log(`Calling API at ${url}...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Atleta Teste 1',
      email: 'atleta1@teste.com',
      phone: '11910000001'
    }),
  });

  const result = await response.json();
  console.log('Response:', result);
}

callPublicApi();
