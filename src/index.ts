import { randomBytes } from 'node:crypto';
import { OAuthClient } from './oauth';

interface Env {
	GITHUB_OAUTH_ID: string;
	GITHUB_OAUTH_SECRET: string;
}

const createOAuth = (env: Env) => {
	return new OAuthClient({
		id: env.GITHUB_OAUTH_ID,
		secret: env.GITHUB_OAUTH_SECRET,
		target: {
			tokenHost: 'https://github.com',
			tokenPath: '/login/oauth/access_token',
			authorizePath: '/login/oauth/authorize',
		},
	});
};

const handleAuth = async (url: URL, env: Env) => {
	const provider = url.searchParams.get('provider');
	if (provider !== 'github') {
		return new Response('Invalid provider', { status: 400 });
	}

	const oauth2 = createOAuth(env);
	const authorizationUri = oauth2.authorizeURL({
		redirect_uri: `https://${url.hostname}/callback?provider=github`,
		scope: 'repo,user',
		state: randomBytes(4).toString('hex'),
	});

	return new Response(null, { headers: { location: authorizationUri }, status: 301 });
};

const callbackScriptResponse = (status: string, token: string) => {
	return new Response(
		`
<html>
<head>
	<script>
		const receiveMessage = (message) => {
			window.opener.postMessage(
				'authorization:github:${status}:${JSON.stringify({ token })}',
				'*'
			);
			window.removeEventListener("message", receiveMessage, false);
		}
		window.addEventListener("message", receiveMessage, false);
		window.opener.postMessage("authorizing:github", "*");
	</script>
	<body>
		<p>Authorizing Decap...</p>
	</body>
</head>
</html>
`,
		{ headers: { 'Content-Type': 'text/html' } }
	);
};

const handleCallback = async (url: URL, env: Env) => {
	const provider = url.searchParams.get('provider');
	if (provider !== 'github') {
		return new Response('Invalid provider', { status: 400 });
	}

	const code = url.searchParams.get('code');
	if (!code) {
		return new Response('Missing code', { status: 400 });
	}

	const oauth2 = createOAuth(env);
	const accessToken = await oauth2.getToken({
		code,
		redirect_uri: `https://${url.hostname}/callback?provider=github`,
	});
	return callbackScriptResponse('success', accessToken);
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/auth') {
			return handleAuth(url, env);
		}
		if (url.pathname === '/callback') {
			return handleCallback(url, env);
		}
		return new Response('Hello 👋');
	},
};
