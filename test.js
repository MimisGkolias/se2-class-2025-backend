import http from 'http';
import { spawn } from 'child_process';
import test from 'ava';

function requestLocalHello() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: 'localhost', port: 3001, path: '/api/hello', method: 'GET' },
      res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

let serverProcess;

test.before(async () => {
  // Start the server before tests
  serverProcess = spawn('node', ['server.js'], { env: { ...process.env, PORT: '3001' } });
  // Wait for server to boot
  await new Promise(r => setTimeout(r, 1000));
});

test.after(() => {
  // Kill the server after tests
  if (serverProcess) serverProcess.kill();
});

test('backend /api/hello endpoint returns 200 with correct message', async t => {
  const resp = await requestLocalHello();
  t.is(resp.status, 200, 'Expected status 200');
  const parsed = JSON.parse(resp.body);
  t.truthy(parsed.message, 'Expected message field');
  t.true(parsed.message.includes('Hello'), 'Expected message to include "Hello"');
  t.truthy(parsed.time, 'Expected time field');
});
