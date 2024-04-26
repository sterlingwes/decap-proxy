type OAuthConfig = {
	id: string;
	secret: string;
	target: {
		tokenHost: string;
		tokenPath: string;
		authorizePath: string;
	};
};

export class OAuthClient {
	private clientConfig: OAuthConfig;

	constructor(config: OAuthConfig) {
		this.clientConfig = config;
	}

	authorizeURL(options: { redirect_uri: string; scope: string; state: string }) {
		const { clientConfig } = this;
		const { tokenHost, authorizePath } = clientConfig.target;
		const { redirect_uri, scope, state } = options;

		return `${tokenHost}${authorizePath}?response_type=code&client_id=${clientConfig.id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}`;
	}

	async getToken(options: { code: string; redirect_uri: string }) {
		const { clientConfig } = this;
		const { tokenHost, tokenPath } = clientConfig.target;
		const { code, redirect_uri } = options;

		const response = await fetch(`${tokenHost}${tokenPath}`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				client_id: clientConfig.id,
				client_secret: clientConfig.secret,
				code,
				redirect_uri,
				grant_type: 'authorization_code',
			}),
		});

		const json = (await response.json()) as { access_token: string };
		return json.access_token;
	}
}
