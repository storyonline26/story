import { expect, test } from '@playwright/test';
import { apiRequest, createAddress } from '../helpers/api';
import { registerFreshUser } from '../helpers/auth';
import { SAMPLE_ADDRESS, toApiAddress } from '../helpers/fixtures';
import { runApiSuiteOnce } from '../helpers/project';

runApiSuiteOnce();

test.describe('API profile', () => {
  test('GET and PUT /api/profile read and update user profile fields', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const profile = await apiRequest(request, '/profile', 'GET', undefined, cookies);
    expect(profile.status()).toBe(200);

    const updated = await apiRequest(request, '/profile', 'PUT', {
      firstName: 'Updated',
      phone: '+919999999999'
    }, cookies);
    expect(updated.status()).toBe(200);
    expect((await updated.json()).data).toMatchObject({ firstName: 'Updated', phone: '+919999999999' });
  });

  test('profile address endpoints create, update, list, and delete addresses', async ({ request }) => {
    const { cookies } = await registerFreshUser(request);
    const created = await createAddress(request, toApiAddress(SAMPLE_ADDRESS), cookies);
    expect(created.data.id).toEqual(expect.any(String));

    const listed = await apiRequest(request, '/profile/addresses', 'GET', undefined, cookies);
    expect((await listed.json()).data).toHaveLength(1);

    const updated = await apiRequest(request, `/profile/addresses/${created.data.id}`, 'PUT', {
      city: 'Delhi',
      state: 'Delhi'
    }, cookies);
    expect(updated.status()).toBe(200);

    const deleted = await apiRequest(request, `/profile/addresses/${created.data.id}`, 'DELETE', undefined, cookies);
    expect(deleted.status()).toBe(200);
  });

  test('protected profile endpoints reject unauthenticated requests', async ({ request }) => {
    expect((await apiRequest(request, '/profile')).status()).toBe(401);
    expect((await apiRequest(request, '/profile/addresses')).status()).toBe(401);
  });
});
