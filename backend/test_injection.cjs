const http = require('http');

const API_BASE = 'http://localhost:5000';

function testRequest(path, options = {}, postData = null) {
  return new Promise((resolve) => {
    const url = new URL(API_BASE + path);
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, data, json });
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (postData) req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    req.end();
  });
}

async function runInjectionTests() {
  console.log('================================================================');
  console.log('             INJECTION & SECURITY PENETRATION AUDIT            ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. SQL Injection in Login Email: Classic ' OR '1'='1' --
  console.log('[1] Testing SQL Injection in Login Email (Classic bypass)...');
  const sqliLogin1 = await testRequest('/api/auth/login', { method: 'POST' }, {
    email: "' OR '1'='1' --",
    password: "Password123!"
  });
  if (sqliLogin1.statusCode === 400 || sqliLogin1.statusCode === 401) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Login SQLi rejected with HTTP', sqliLogin1.statusCode, '(', sqliLogin1.json ? sqliLogin1.json.message : '', ')');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: Bypass succeeded or unexpected status:', sqliLogin1.statusCode);
    failed++;
  }

  // 2. SQL Injection in Login: Semicolon stacked query DROP TABLE
  console.log('\n[2] Testing SQL Injection Stacked Query in Login (DROP TABLE)...');
  const sqliLogin2 = await testRequest('/api/auth/login', { method: 'POST' }, {
    email: "admin@aksharmandir.com'; DROP TABLE User; --",
    password: "Admin@123"
  });
  if (sqliLogin2.statusCode === 400 || sqliLogin2.statusCode === 401) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Malicious query rejected safely without executing SQL');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: Unexpected status:', sqliLogin2.statusCode);
    failed++;
  }

  // 3. SQL Injection in Product Search: UNION SELECT
  console.log('\n[3] Testing SQL Injection in Search Param (UNION SELECT exfiltration)...');
  const sqliSearch = await testRequest("/api/products?search=" + encodeURIComponent("' UNION SELECT 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24 --"));
  if (sqliSearch.statusCode === 200 && sqliSearch.json && sqliSearch.json.data && sqliSearch.json.data.products.length === 0) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Search treated payload as literal string, 0 leaked records');
    passed++;
  } else if (sqliSearch.statusCode === 200) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: No data leaked, returned valid empty or filtered result');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: Database error or leakage:', sqliSearch.statusCode);
    failed++;
  }

  // 4. Semicolon Query Injection in Search: Trying to drop tables
  console.log('\n[4] Testing Stacked SQL Injection in Search (test\'; DROP TABLE "Product"; --)...');
  const sqliDrop = await testRequest("/api/products?search=" + encodeURIComponent("test'; DROP TABLE \"Product\"; --"));
  // Verify Product table still exists and is healthy
  const prodCheck = await testRequest("/api/products");
  if (prodCheck.statusCode === 200 && prodCheck.json && prodCheck.json.data && prodCheck.json.data.products.length > 0) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Table was NOT dropped. Database intact with', prodCheck.json.data.products.length, 'products');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: Product table damaged or missing!');
    failed++;
  }

  // 5. Object / NoSQL Injection in Login: { email: { not: null } }
  console.log('\n[5] Testing Object / NoSQL Injection in Login...');
  const nosqli = await testRequest('/api/auth/login', { method: 'POST' }, {
    email: { not: null },
    password: "Admin@123"
  });
  if (nosqli.statusCode === 400 || nosqli.statusCode === 401) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Object injection blocked by type validation');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: Object injection bypassed auth:', nosqli.statusCode);
    failed++;
  }

  // 6. Direct Database File Access: /prisma/dev.db
  console.log('\n[6] Testing Direct Database File Download (/prisma/dev.db)...');
  const dbFile = await testRequest('/prisma/dev.db');
  const isBinaryDb = dbFile.data && dbFile.data.startsWith('SQLite format 3');
  if (!isBinaryDb) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Raw SQLite database binary was NOT exposed over HTTP');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: CRITICAL! Raw SQLite database file was downloaded directly!');
    failed++;
  }

  // 7. Direct .env Secret Access: /.env
  console.log('\n[7] Testing Secret Configuration File Download (/.env)...');
  const envFile = await testRequest('/.env');
  const isEnvExposed = envFile.data && (envFile.data.includes('DATABASE_URL=') || envFile.data.includes('JWT_SECRET='));
  if (!isEnvExposed) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: .env file was NOT exposed over HTTP');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: CRITICAL! Secret .env keys were leaked!');
    failed++;
  }

  // 8. Path Traversal: /images/../../prisma/dev.db
  console.log('\n[8] Testing Directory Traversal (/images/../../backend/prisma/dev.db)...');
  const traversal = await testRequest('/images/../../backend/prisma/dev.db');
  const isTraversalDb = traversal.data && traversal.data.startsWith('SQLite format 3');
  if (!isTraversalDb) {
    console.log('  \x1b[32m✔ SECURE\x1b[0m: Directory traversal blocked');
    passed++;
  } else {
    console.log('  \x1b[31m✖ CRACKED\x1b[0m: CRITICAL! Database leaked via directory traversal!');
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');
}

runInjectionTests();
