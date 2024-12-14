import { request } from 'node:http';
import process from 'node:process';
import { receiveBody } from './utils/network.js';

const port = process.env.PORT;
const options = new URL(`http://localhost:${port}/api/healthcheck`);

const req = request(options, async function handleResponse(res) {
  if (res.statusCode === 200) {
    return res.destroy();
  }

  const data = await receiveBody(res);
  res.destroy();

  process.stderr.write(`StatusCode: ${res.statusCode}`);
  process.stderr.write('\n');
  process.stderr.write(data);
  process.stderr.write('\n');
  process.exit(1);
});

req.end();
