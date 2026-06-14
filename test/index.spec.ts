// test/index.spec.ts
import { SELF } from 'cloudflare:test';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
	vi.unstubAllGlobals();
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
		vi.stubGlobal(
			'fetch',
			vi.fn(async () =>
				new Response(JSON.stringify({ access_token: 'some-access-token' }), {
					headers: { 'Content-Type': 'application/json' },
				})
			)
		);

		const response = await SELF.fetch(
			'https://example.com/callback?provider=github&code=some-authorization-code'
		);
		expect(response.status).toBe(200);
		const responseBody = await response.text();
		expect(responseBody).toEqual(expect.stringContaining('window.opener.postMessage("authorizing:github", "*");'));
	});
});
