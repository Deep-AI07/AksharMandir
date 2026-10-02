const http = require('http');

const API_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

function logPass(msg) {
  passed++;
  console.log(`  \x1b[32m✔ PASS\x1b[0m: ${msg}`);
  results.push({ status: 'PASS', message: msg });
}

function logFail(msg, detail = '') {
  failed++;
  console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${msg} ${detail ? `(${detail})` : ''}`);
  results.push({ status: 'FAIL', message: msg, detail });
}

function request(urlStr, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      timeout: 10000
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          // not JSON, keep as raw data
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('       AKSHAR MANDIR FULL PUBLICATION READINESS TEST SUITE      ');
  console.log('===============================================================\n');

  // TEST SUITE 1: System Health & Server Connectivity
  console.log('\x1b[34m[1/8] Checking Health & Server Connectivity...\x1b[0m');
  try {
    const health = await request(`${API_BASE}/api/health`);
    if (health.statusCode === 200 && health.json && (health.json.status === 'healthy' || health.json.status === 'OK')) {
      logPass(`Backend health endpoint /api/health responded HTTP 200 (${health.json.service})`);
    } else {
      logFail('Backend health check', `status: ${health.statusCode}`);
    }
  } catch (err) {
    logFail('Backend health check connection', err.message);
  }

  // TEST SUITE 2: Product & Category Catalogs & Real Mandir Images
  console.log('\n\x1b[34m[2/8] Testing Categories & Products Integrity...\x1b[0m');
  let products = [];
  let categories = [];
  try {
    const catRes = await request(`${API_BASE}/api/categories`);
    if (catRes.statusCode === 200 && catRes.json && catRes.json.data && Array.isArray(catRes.json.data.categories)) {
      categories = catRes.json.data.categories;
      logPass(`Found ${categories.length} active categories in database`);
      
      let allCatMandirImages = true;
      for (const cat of categories) {
        if (!cat.image || !cat.image.includes('/images/mandirs/')) {
          allCatMandirImages = false;
          logFail(`Category '${cat.name}' has non-mandir image: ${cat.image}`);
        }
      }
      if (allCatMandirImages) {
        logPass('All 6 categories are verified using authentic local Mandir imagery');
      }
    } else {
      logFail('Category fetching /api/categories', `status: ${catRes.statusCode}`);
    }

    const prodRes = await request(`${API_BASE}/api/products`);
    if (prodRes.statusCode === 200 && prodRes.json && prodRes.json.data && Array.isArray(prodRes.json.data.products)) {
      products = prodRes.json.data.products;
      logPass(`Found ${products.length} products in active catalog`);

      let allMandirImages = true;
      for (const p of products) {
        if (!p.images || p.images.length === 0) {
          allMandirImages = false;
          logFail(`Product ${p.title} has no images`);
          continue;
        }
        for (const img of p.images) {
          const url = typeof img === 'string' ? img : (img && img.url ? img.url : '');
          if (!url || !url.includes('/images/mandirs/')) {
            allMandirImages = false;
            logFail(`Product ${p.title} image is not authentic mandir: ${url}`);
          }
        }
      }
      if (allMandirImages) {
        logPass(`All ${products.length} products have exclusively authentic mandir images`);
      }
    } else {
      logFail('Product fetching /api/products', `status: ${prodRes.statusCode}`);
    }
  } catch (err) {
    logFail('Catalog retrieval', err.message);
  }

  // TEST SUITE 3: Static Asset Serving across Ports
  console.log('\n\x1b[34m[3/8] Testing Image Asset Accessibility across 3000 & 5000...\x1b[0m');
  const sampleMandirImages = [
    'mandir_royal_sheesham.jpg',
    'mandir_aura_modern.jpg',
    'mandir_grand_haveli.jpg',
    'mandir_wall_shrine.jpg',
    'mandir_lotus_brass.jpg',
    'mandir_gilded_gopuram.jpg',
    'mandir_devi_sanctum.jpg',
    'mandir_rosewood_elephant.jpg',
    'mandir_white_marble.jpg',
    'mandir_detail_bells.jpg',
    'mandir_sanctum_aarti.jpg',
    'mandir_hero_banner.jpg'
  ];

  let assetsAccessible5000 = true;
  let assetsAccessible3000 = true;

  for (const img of sampleMandirImages) {
    try {
      const res5000 = await request(`${API_BASE}/images/mandirs/${img}`);
      if (res5000.statusCode !== 200) {
        assetsAccessible5000 = false;
        logFail(`Port 5000 failed to serve /images/mandirs/${img}`, `status: ${res5000.statusCode}`);
      }
    } catch (e) {
      assetsAccessible5000 = false;
      logFail(`Port 5000 connection error for ${img}`, e.message);
    }

    try {
      const res3000 = await request(`${FRONTEND_BASE}/images/mandirs/${img}`);
      if (res3000.statusCode !== 200) {
        assetsAccessible3000 = false;
        logFail(`Port 3000 failed to serve /images/mandirs/${img}`, `status: ${res3000.statusCode}`);
      }
    } catch (e) {
      assetsAccessible3000 = false;
      logFail(`Port 3000 connection error for ${img}`, e.message);
    }
  }

  if (assetsAccessible5000) {
    logPass(`All 12 authentic Mandir images served successfully via Backend (Port 5000)`);
  }
  if (assetsAccessible3000) {
    logPass(`All 12 authentic Mandir images served successfully via Frontend (Port 3000)`);
  }

  // TEST SUITE 4: Authentication & Role-Based Access Control
  console.log('\n\x1b[34m[4/8] Testing Authentication & RBAC Security...\x1b[0m');
  let adminToken = '';
  let customer1Token = '';
  let customer1User = null;
  let customer2Token = '';

  // 4.1 Admin Login
  try {
    const loginRes = await request(`${API_BASE}/api/auth/login`, { method: 'POST' }, {
      email: 'admin@aksharmandir.com',
      password: 'Admin@123'
    });
    if (loginRes.statusCode === 200 && loginRes.json && loginRes.json.data && loginRes.json.data.token) {
      adminToken = loginRes.json.data.token;
      if (loginRes.json.data.user.role === 'ADMIN') {
        logPass('Admin login succeeded with ADMIN role permissions');
      } else {
        logFail('Admin login returned unexpected role', loginRes.json.data.user.role);
      }
    } else {
      logFail('Admin login', `status: ${loginRes.statusCode}`);
    }
  } catch (err) {
    logFail('Admin login exception', err.message);
  }

  // 4.2 Customer 1 Login
  try {
    const cust1Res = await request(`${API_BASE}/api/auth/login`, { method: 'POST' }, {
      email: 'customer@aksharmandir.com',
      password: 'Customer@123'
    });
    if (cust1Res.statusCode === 200 && cust1Res.json && cust1Res.json.data && cust1Res.json.data.token) {
      customer1Token = cust1Res.json.data.token;
      customer1User = cust1Res.json.data.user;
      logPass(`Customer 1 login succeeded: ${customer1User.name} (${customer1User.email})`);
    } else {
      logFail('Customer 1 login', `status: ${cust1Res.statusCode}`);
    }
  } catch (err) {
    logFail('Customer 1 login exception', err.message);
  }

  // 4.3 Customer 2 Login
  try {
    const cust2Res = await request(`${API_BASE}/api/auth/login`, { method: 'POST' }, {
      email: 'abc123@gmail.com',
      password: 'deep@123'
    });
    if (cust2Res.statusCode === 200 && cust2Res.json && cust2Res.json.data && cust2Res.json.data.token) {
      customer2Token = cust2Res.json.data.token;
      logPass(`Customer 2 login succeeded: ${cust2Res.json.data.user.name} (${cust2Res.json.data.user.email})`);
    } else {
      logFail('Customer 2 login', `status: ${cust2Res.statusCode}`);
    }
  } catch (err) {
    logFail('Customer 2 login exception', err.message);
  }

  // 4.4 Brute Force / Invalid Password Rejection
  try {
    const badLogin = await request(`${API_BASE}/api/auth/login`, { method: 'POST' }, {
      email: 'admin@aksharmandir.com',
      password: 'WrongPassword!99'
    });
    if (badLogin.statusCode === 401 || badLogin.statusCode === 400) {
      logPass('Invalid password correctly rejected with 401/400 Unauthorized');
    } else {
      logFail('Security vulnerability: bad credentials did not return 401', `status: ${badLogin.statusCode}`);
    }
  } catch (err) {
    logFail('Bad login test exception', err.message);
  }

  // 4.5 RBAC: Customer trying to access Admin API
  try {
    const adminAccessAsCustomer = await request(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customer1Token}` }
    });
    if (adminAccessAsCustomer.statusCode === 403 || adminAccessAsCustomer.statusCode === 401) {
      logPass('RBAC Security: Non-admin customer forbidden (HTTP 403/401) from admin routes');
    } else {
      logFail('RBAC Violation: Customer accessed admin endpoint!', `status: ${adminAccessAsCustomer.statusCode}`);
    }
  } catch (err) {
    logFail('RBAC security test exception', err.message);
  }

  // 4.6 RBAC: Master Admin accessing Admin API
  try {
    const adminAccessAsAdmin = await request(`${API_BASE}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (adminAccessAsAdmin.statusCode === 200) {
      logPass('Master Admin successfully authorized on /api/admin/dashboard');
    } else {
      logFail('Admin dashboard authorization failed', `status: ${adminAccessAsAdmin.statusCode}`);
    }
  } catch (err) {
    logFail('Admin dashboard test exception', err.message);
  }

  // TEST SUITE 5: Cart, Guest-to-Login Persistence & Coupon System
  console.log('\n\x1b[34m[5/8] Testing Cart Operations & Coupon System...\x1b[0m');
  const targetProduct = products.find(p => p.stockQuantity > 0) || products[0] || { id: 'test', price: 45000 };

  // 5.1 Add to Cart
  try {
    const addCartRes = await request(`${API_BASE}/api/cart/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` }
    }, {
      productId: targetProduct.id,
      quantity: 1,
      finish: 'Natural Teak Polish'
    });
    if (addCartRes.statusCode === 200 || addCartRes.statusCode === 201) {
      logPass(`Added '${targetProduct.title}' to devotee cart successfully`);
    } else {
      logFail('Add to cart failed', `status: ${addCartRes.statusCode}, body: ${addCartRes.data}`);
    }
  } catch (err) {
    logFail('Add to cart exception', err.message);
  }

  // 5.2 Retrieve Cart
  try {
    const getCartRes = await request(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${customer1Token}` }
    });
    if (getCartRes.statusCode === 200 && getCartRes.json && getCartRes.json.data) {
      const cartData = getCartRes.json.data;
      if (cartData.items && cartData.items.length > 0) {
        logPass(`Devotee cart retrieved with ${cartData.items.length} item(s), subtotal: ₹${cartData.subtotal}`);
      } else {
        logFail('Devotee cart items empty after addition');
      }
    } else {
      logFail('Get cart failed', `status: ${getCartRes.statusCode}`);
    }
  } catch (err) {
    logFail('Get cart exception', err.message);
  }

  // 5.3 Validate Valid Coupon DIVINE10
  try {
    const couponRes = await request(`${API_BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` }
    }, {
      code: 'DIVINE10',
      subtotal: 45000
    });
    if (couponRes.statusCode === 200 && couponRes.json && couponRes.json.data) {
      logPass(`Valid coupon 'DIVINE10' verified: discount ₹${couponRes.json.data.discountAmount}`);
    } else {
      logFail('Coupon validation for DIVINE10 failed', `status: ${couponRes.statusCode}, body: ${couponRes.data}`);
    }
  } catch (err) {
    logFail('Coupon validation exception', err.message);
  }

  // 5.4 Validate Valid Coupon SHANTI5000
  try {
    const couponRes = await request(`${API_BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` }
    }, {
      code: 'SHANTI5000',
      subtotal: 45000
    });
    if (couponRes.statusCode === 200 && couponRes.json && couponRes.json.data) {
      logPass(`Valid coupon 'SHANTI5000' verified: discount ₹${couponRes.json.data.discountAmount}`);
    } else {
      logFail('Coupon validation for SHANTI5000 failed', `status: ${couponRes.statusCode}`);
    }
  } catch (err) {
    logFail('Coupon validation exception', err.message);
  }

  // 5.5 Validate Fake Coupon
  try {
    const badCouponRes = await request(`${API_BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` }
    }, {
      code: 'FAKEDISCOUNT999',
      subtotal: 45000
    });
    if (badCouponRes.statusCode === 400 || badCouponRes.statusCode === 404) {
      logPass('Invalid coupon correctly rejected with 400/404');
    } else {
      logFail('Security: Fake coupon was not rejected', `status: ${badCouponRes.statusCode}`);
    }
  } catch (err) {
    logFail('Bad coupon exception', err.message);
  }

  // TEST SUITE 6: Checkout, Order Placement & User Order History Retrieval
  // (Testing User Request #1: "when i buy without log in then it show to lg in and when i done login then previous order are not fetched fix it")
  console.log('\n\x1b[34m[6/8] Testing Order Placement & Post-Login Order History Retrieval...\x1b[0m');
  let placedOrderId = null;
  let placedOrderNumber = null;
  try {
    const orderPayload = {
      customerName: 'Sanctum Devotee',
      customerEmail: 'customer@aksharmandir.com',
      customerPhone: '+91 98765 43210',
      shippingAddress: {
        fullName: 'Sanctum Devotee',
        phone: '+91 98765 43210',
        streetAddress: 'Flat 402, Shanti Nilayam Apartments',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038'
      },
      items: [
        {
          productId: targetProduct.id,
          quantity: 1,
          selectedFinish: 'Natural Teak Polish'
        }
      ],
      paymentMethod: 'COD',
      couponCode: 'DIVINE10'
    };

    const checkoutRes = await request(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer1Token}` }
    }, orderPayload);

    if (checkoutRes.statusCode === 201 || checkoutRes.statusCode === 200) {
      const orderData = checkoutRes.json.data.order;
      placedOrderId = orderData.id;
      placedOrderNumber = orderData.orderNumber;
      logPass(`Order placed successfully with orderNumber: ${placedOrderNumber} (ID: ${placedOrderId})`);
    } else {
      logFail('Checkout order placement failed', `status: ${checkoutRes.statusCode}, body: ${checkoutRes.data}`);
    }
  } catch (err) {
    logFail('Order checkout exception', err.message);
  }

  // 6.2 Customer fetches their order history
  try {
    const myOrdersRes = await request(`${API_BASE}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customer1Token}` }
    });
    if (myOrdersRes.statusCode === 200 && myOrdersRes.json && myOrdersRes.json.data && Array.isArray(myOrdersRes.json.data.orders)) {
      const userOrders = myOrdersRes.json.data.orders;
      const foundPlacedOrder = userOrders.find(o => o.id === placedOrderId);
      if (foundPlacedOrder) {
        logPass(`Devotee order history verified: Placed order ${foundPlacedOrder.orderNumber} retrieved accurately!`);
      } else {
        logFail('Placed order was not found in my-orders response');
      }
    } else {
      logFail('Get my-orders endpoint failed', `status: ${myOrdersRes.statusCode}, body: ${myOrdersRes.data}`);
    }
  } catch (err) {
    logFail('Get my-orders exception', err.message);
  }

  // TEST SUITE 7: Custom Mandir Quotation Workflow
  console.log('\n\x1b[34m[7/8] Testing Custom Mandir Quotation Workflow...\x1b[0m');
  try {
    const quotationPayload = {
      fullName: 'Deep Devotee',
      phone: '+91 98765 43210',
      email: 'abc123@gmail.com',
      width: 48,
      depth: 24,
      height: 60,
      materialPreference: 'Solid Sheesham Wood',
      finishType: 'Natural Teak Polish',
      mounting: 'Floor Rested',
      features: ['Carved Gopuram', 'Brass Bells', 'Backlit Amber LED'],
      additionalRequirements: 'Requesting tuned acoustic brass bells on the side arches',
      estimatedQuote: 65000
    };

    const quotationRes = await request(`${API_BASE}/api/custom-orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customer2Token}` }
    }, quotationPayload);

    if (quotationRes.statusCode === 201 || quotationRes.statusCode === 200) {
      const customOrder = quotationRes.json.data.customOrder;
      logPass(`Custom Mandir Consultation ticket created: ${customOrder.requestNumber || customOrder.id} (Status: ${customOrder.status})`);
    } else {
      logFail('Custom Mandir Quotation failed', `status: ${quotationRes.statusCode}, body: ${quotationRes.data}`);
    }
  } catch (err) {
    logFail('Custom quotation exception', err.message);
  }

  // TEST SUITE 8: API Security, 404 Guards & Privacy Compliance
  console.log('\n\x1b[34m[8/8] Testing Security, 404 Guards & Privacy Compliance...\x1b[0m');
  try {
    const unknownRes = await request(`${API_BASE}/api/non-existent-endpoint-${Date.now()}`);
    if (unknownRes.statusCode === 404 && unknownRes.json && unknownRes.json.success === false) {
      logPass('Unmatched /api/* route correctly returns JSON 404 response');
    } else {
      logFail('Unmatched API route failed 404 JSON check', `status: ${unknownRes.statusCode}, body: ${unknownRes.data}`);
    }
  } catch (err) {
    logFail('404 guard test exception', err.message);
  }

  // Verify Store Settings do NOT expose private developer phone
  try {
    const settingsRes = await request(`${API_BASE}/api/content/settings`);
    if (settingsRes.statusCode === 200) {
      const settingsStr = JSON.stringify(settingsRes.json);
      if (settingsStr.includes('90232 30569') || settingsStr.includes('9023230569')) {
        logFail('PRIVACY ALERT: Developer personal phone number leaked in public settings!');
      } else {
        logPass('Privacy Compliance: No private developer phone numbers in public settings');
      }
    }
  } catch (err) {
    logFail('Store settings check', err.message);
  }

  // SUMMARY
  console.log('\n===============================================================');
  console.log(`                     TEST SUMMARY REPORT                      `);
  console.log('===============================================================');
  console.log(`  TOTAL CHECKS: ${passed + failed}`);
  console.log(`  PASSED:       \x1b[32m${passed}\x1b[0m`);
  console.log(`  FAILED:       \x1b[${failed > 0 ? '31' : '32'}m${failed}\x1b[0m`);
  console.log(`  STATUS:       ${failed === 0 ? '\x1b[32m100% ALL CHECKS PASSED - READY FOR PUBLICATION\x1b[0m' : '\x1b[31mACTION REQUIRED\x1b[0m'}`);
  console.log('===============================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
