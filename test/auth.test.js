const assert = require('assert');
const http = require('http');
const app = require('../server');

let server;
const PORT = 3100;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('Starting EstateX Auth Tests...\n');

  server = app.listen(PORT);
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const register = await request('POST', '/api/auth/register', {
      name: 'New Tester',
      email: 'newtester@estatex.com',
      password: 'StrongPass!123',
      role: 'client'
    });

    assert.strictEqual(register.status, 201, 'Registration should return 201');
    assert.strictEqual(register.body.success, true, 'Registration success should be true');
    assert.ok(register.body.data.token, 'Registration response should include a token');
    console.log(' -> PASSED: Registration works');

    const login = await request('POST', '/api/auth/login', {
      email: 'admin@estatex.com',
      password: 'Admin@123'
    });

    assert.strictEqual(login.status, 200, 'Login should return 200');
    assert.strictEqual(login.body.success, true, 'Login success should be true');
    assert.ok(login.body.data.token, 'Login response should include a token');
    console.log(' -> PASSED: Login works');

    const protectedRoute = await request('GET', '/api/auth/me', null, login.body.data.token);
    assert.strictEqual(protectedRoute.status, 200, 'Protected route should return 200');
    assert.strictEqual(protectedRoute.body.data.email, 'admin@estatex.com', 'Protected route should return the authenticated user');
    console.log(' -> PASSED: Authenticated profile works');

    const forbidden = await request('GET', '/api/auth/admin-check', null, login.body.data.token);
    assert.strictEqual(forbidden.status, 200, 'Admin check should return 200 for admin user');
    console.log(' -> PASSED: Role-based authorization works');

    console.log('\n========================================');
    console.log('ALL AUTH TESTS PASSED!');
    console.log('========================================\n');
  } catch (error) {
    console.error('\nAUTH TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();
