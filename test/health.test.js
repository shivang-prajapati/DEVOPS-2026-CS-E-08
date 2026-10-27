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

    const configuredSetupKey = process.env.ADMIN_SETUP_KEY;
    delete process.env.ADMIN_SETUP_KEY;
    const setupResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/setup-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Admin', email: 'admin@example.com', password: 'a-strong-password' })
    });
    if (configuredSetupKey === undefined) {
      delete process.env.ADMIN_SETUP_KEY;
    } else {
      process.env.ADMIN_SETUP_KEY = configuredSetupKey;
    }
    assert.strictEqual(setupResponse.status, 503);

    const siteResponse = await fetch(`http://127.0.0.1:${server.address().port}/`);
    assert.strictEqual(siteResponse.status, 200);
    assert.match(siteResponse.headers.get('content-type'), /text\/html/);

    for (const route of ['/crm', '/crm/', '/assets/js/crm.js', '/assets/css/crm.css']) {
      const pageResponse = await fetch(`http://127.0.0.1:${server.address().port}${route}`);
      assert.strictEqual(pageResponse.status, 200, `${route} should be served`);
    }

    console.log('Health, site, CRM, and static asset routes respond correctly with MongoDB disconnected.');
  } catch (error) {
    console.error('Health check test failed:', error);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
