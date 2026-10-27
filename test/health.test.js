const assert = require('node:assert/strict');
const app = require('../server/app');

const server = app.listen(0, async () => {
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    const health = await response.json();

    assert.strictEqual(response.status, 503);
    assert.strictEqual(health.success, false);
    assert.strictEqual(health.status, 'DOWN');
    assert.strictEqual(health.database, 'mongodb');

    const siteResponse = await fetch(`http://127.0.0.1:${server.address().port}/`);
    assert.strictEqual(siteResponse.status, 200);
    assert.match(siteResponse.headers.get('content-type'), /text\/html/);
    console.log('Health and site routes respond correctly with MongoDB disconnected.');
  } catch (error) {
    console.error('Health check test failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
