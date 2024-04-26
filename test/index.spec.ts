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

// TODO: figure out how to mock outbound fetch
// commented on prior issue: https://github.com/cloudflare/miniflare/issues/609#issuecomment-2079988386

// describe('GET /callback', () => {
// 	it('responds with html page w/ JS messaging script', async () => {
// 		fetchMock
// 			.get('https://example.com')
// 			.intercept({ path: '/login/oauth/access_token' })
// 			.reply(200, JSON.stringify({ access_token: 'some-access-token' }));

// 		const response = await SELF.fetch('https://example.com/callback?provider=github&code=some-authorization-code');
// 		expect(response.status).toBe(200);
// 		expect(await response.text()).toEqual(
// 			expect.stringContaining('window.opener.postMessage("authorization:github:success:{"token":"some-access-token"}","*")')
// 		);
// 	});
// });
