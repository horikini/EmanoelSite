
import handler from './api/criar-atleta.js';

const req = {
  method: 'POST',
  body: {
    name: 'Atleta Teste 1',
    email: 'atleta1@teste.com',
    phone: '11910000001'
  }
};

const res = {
  setHeader: () => {},
  status: (code: number) => ({
    json: (data: any) => {
      console.log(`Status: ${code}`);
      console.log('Response:', data);
    },
    end: () => {}
  })
};

async function run() {
  await handler(req, res);
}

run();
