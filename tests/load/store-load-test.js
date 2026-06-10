/**
 * k6 Load Test for STORY India E-commerce
 *
 * Install k6: winget install grafana.k6
 * Run: k6 run tests/load/store-load-test.js
 * Run with more users: k6 run --vus 200 --duration 60s tests/load/store-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const productLoadTime = new Trend('product_load_time');
const cartLoadTime = new Trend('cart_load_time');

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export const options = {
  stages: [
    { duration: '10s', target: 20 },   // Ramp up to 20 users
    { duration: '30s', target: 50 },   // Hold at 50 users
    { duration: '20s', target: 100 },  // Spike to 100 users
    { duration: '10s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 95% of requests under 5s
    errors: ['rate<0.1'],               // Less than 10% error rate
    product_load_time: ['p(95)<3000'],  // Products API under 3s
  },
};

export default function () {
  group('Browse Products', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/products?limit=20`);
    productLoadTime.add(Date.now() - start);

    const success = check(res, {
      'products: status 200': (r) => r.status === 200,
      'products: has data': (r) => JSON.parse(r.body).data?.length > 0,
      'products: response < 5s': (r) => r.timings.duration < 5000,
    });
    errorRate.add(!success);
  });

  sleep(1);

  group('View Categories', () => {
    const res = http.get(`${BASE_URL}/categories`);
    const success = check(res, {
      'categories: status 200': (r) => r.status === 200,
      'categories: has data': (r) => JSON.parse(r.body).data?.length > 0,
    });
    errorRate.add(!success);
  });

  sleep(0.5);

  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health: status 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);

  group('Search Products', () => {
    const queries = ['shirt', 'dress', 'jacket', 'pants', 'shoes'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    const res = http.get(`${BASE_URL}/products?search=${query}&limit=10`);
    check(res, {
      'search: status 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('Simulate Checkout Flow', () => {
    // Register a unique user
    const email = `loadtest-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
    const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
      firstName: 'Load',
      lastName: 'Tester',
      email,
      phone: '+919000000000',
      password: 'LoadTest123!',
    }), { headers: { 'Content-Type': 'application/json' } });

    if (registerRes.status === 201) {
      // Login
      const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email,
        password: 'LoadTest123!',
      }), { headers: { 'Content-Type': 'application/json' } });

      if (loginRes.status === 200) {
        const cookies = loginRes.cookies;
        const cookieHeader = Object.entries(cookies)
          .map(([name, values]) => `${name}=${values[0].value}`)
          .join('; ');

        // Get cart
        const start = Date.now();
        const cartRes = http.get(`${BASE_URL}/cart`, {
          headers: { Cookie: cookieHeader },
        });
        cartLoadTime.add(Date.now() - start);

        check(cartRes, {
          'cart: status 200': (r) => r.status === 200,
        });
      }
    }
  });

  sleep(2);
}

export function handleSummary(data) {
  const summary = {
    totalRequests: data.metrics.http_reqs?.values?.count || 0,
    avgResponseTime: Math.round(data.metrics.http_req_duration?.values?.avg || 0),
    p95ResponseTime: Math.round(data.metrics.http_req_duration?.values?.['p(95)'] || 0),
    maxResponseTime: Math.round(data.metrics.http_req_duration?.values?.max || 0),
    errorRate: ((data.metrics.errors?.values?.rate || 0) * 100).toFixed(2) + '%',
    httpErrors: data.metrics.http_req_failed?.values?.rate || 0,
  };

  console.log('\n📊 Load Test Summary:');
  console.log(`   Total Requests: ${summary.totalRequests}`);
  console.log(`   Avg Response: ${summary.avgResponseTime}ms`);
  console.log(`   P95 Response: ${summary.p95ResponseTime}ms`);
  console.log(`   Max Response: ${summary.maxResponseTime}ms`);
  console.log(`   Error Rate: ${summary.errorRate}`);
  console.log('');

  return {
    'test-results/load-test-summary.json': JSON.stringify(summary, null, 2),
  };
}
