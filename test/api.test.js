const assert = require('assert');
const http = require('http');
const app = require('../server');

let server;
const PORT = 3099;

function request(method, path, body = null) {
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
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
  console.log('Starting EstateX Backend Data Entry API & Database Tests...\n');
  
  // Start server on test port
  server = app.listen(PORT);
  // Allow the MongoDB connection to initialize before requests.
  await new Promise(r => setTimeout(r, 500));

  try {
    // 1. Health check
    console.log('[TEST 1] GET /api/health');
    const health = await request('GET', '/api/health');
    assert.strictEqual(health.status, 200, 'Health endpoint status should be 200');
    assert.strictEqual(health.body.status, 'UP', 'Health status should be UP');
    console.log(' -> PASSED: Health check OK');

    // 2. Submit Contact Entry
    console.log('\n[TEST 2] POST /api/contact (Data Entry Submission)');
    const contactPayload = {
      name: 'Jenkins Test User',
      email: 'jenkins.test@estatex.io',
      subject: 'Automated CI/CD Test Inquiry',
      message: 'Testing data entry persistence into MongoDB database.'
    };
    const postContact = await request('POST', '/api/contact', contactPayload);
    assert.strictEqual(postContact.status, 201, 'Contact creation status should be 201');
    assert.strictEqual(postContact.body.success, true, 'Contact creation response success should be true');
    assert.ok(postContact.body.data.id, 'Created contact entry must return an ID');
    console.log(' -> PASSED: Contact entry saved with ID', postContact.body.data.id);

    // 3. Query Contacts from Database
    console.log('\n[TEST 3] GET /api/contact (Data Retrieval)');
    const getContacts = await request('GET', '/api/contact');
    assert.strictEqual(getContacts.status, 200, 'GET /api/contact status should be 200');
    assert.ok(Array.isArray(getContacts.body.data), 'Contacts data should be an array');
    const foundContact = getContacts.body.data.find(c => c.email === 'jenkins.test@estatex.io');
    assert.ok(foundContact, 'Submitted contact entry must be retrieved from MongoDB');
    console.log(' -> PASSED: Retrieved contact entry from database:', foundContact.name);

    // 4. Submit Property Enquiry Entry
    console.log('\n[TEST 4] POST /api/enquiries (Property Enquiry Submission)');
    const enquiryPayload = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1 555-0199',
      property_id: 'PROP-101',
      message: 'Interested in touring the Modern Apartments.'
    };
    const postEnquiry = await request('POST', '/api/enquiries', enquiryPayload);
    assert.strictEqual(postEnquiry.status, 201, 'Enquiry status should be 201');
    assert.strictEqual(postEnquiry.body.success, true, 'Enquiry response success should be true');
    console.log(' -> PASSED: Property enquiry saved with ID', postEnquiry.body.data.id);

    // 5. Query Properties from Database
    console.log('\n[TEST 5] GET /api/properties (Property Listings Data)');
    const getProps = await request('GET', '/api/properties');
    assert.strictEqual(getProps.status, 200, 'GET /api/properties status should be 200');
    assert.ok(getProps.body.data.length >= 3, 'Initial seeded properties should exist');
    console.log(' -> PASSED: Retrieved', getProps.body.data.length, 'properties from database');

    console.log('\n========================================');
    console.log('ALL BACKEND & DATABASE DATA ENTRY TESTS PASSED!');
    console.log('========================================\n');
  } catch (err) {
    console.error('\nTEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

runTests();
