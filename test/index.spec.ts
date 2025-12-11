// test/index.spec.ts
import { SELF, fetchMock } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';

beforeAll(() => {
	fetchMock.activate();
	fetchMock.disableNetConnect();
});

describe('GET /', () => {
	it('responds with no-op (Hello)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(await response.text()).toMatchInlineSnapshot(`"Hello 👋"`);
	});
});

describe('GET /auth', () => {
	it('responds with redirected location', async () => {
		const response = await SELF.fetch('https://example.com/auth?provider=github');
		expect(response.status).toBe(200);
		expect(response.url).toEqual(
			expect.stringContaining(
				'https://github.com/login/oauth/authorize?response_type=code&client_id=undefined&redirect_uri=https://example.com/callback?provider=github&scope=public_repo,user&state='
			)
		);
	});
});

describe('GET /callback', () => {
	it('responds with html page w/ JS messaging script', async () => {
		fetchMock
			.get('https://github.com')
			.intercept({ path: '/login/oauth/access_token', method: 'POST' })
			.reply(200, JSON.stringify({ access_token: 'some-access-token' }));

		const response = await SELF.fetch('https://example.com/callback?provider=github&code=some-authorization-code');
		expect(response.status).toBe(200);
		const responseBody = await response.text();
		expect(responseBody).toEqual(expect.stringContaining('window.opener.postMessage("authorizing:github", "*");'));
	});
});
