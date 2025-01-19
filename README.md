# decap-proxy

A Cloudflare Worker Github OAuth proxy for [Decap CMS](https://github.com/decaporg/decap-cms). This allows for deploying Decap without the Netlify Identity or Git Gateway services required to handle Github authentication so that the CMS client can make Github API calls.

This proxy is intended to be deployed on its own subdomain, separate from whatever website domain you're using Decap with.

## Getting Started

### Create a Github OAuth App

You'll need to [configure a Github OAuth application](https://github.com/settings/applications/new). Your `Application callback URL` must be the domain you deploy your worker to with the `/callback` path. Based on the sample configuration below, that would mean `https://decap.mydomain.com/callback`.

Save the OAuth client ID and secret for later, you'll need to provide those secrets to the worker.

If your GitHub repo (where you want Decap CMS to push content to) is private, you will have to change the scope in `index.ts` to:
```typescript
scope: 'repo,user'
```
So, your code after the change should look like:
```typescript
const authorizationUri = oauth2.authorizeURL({
  redirect_uri: `https://${url.hostname}/callback?provider=github`,
  scope: 'repo,user',
  state: randomBytes(4).toString('hex'),
});
```

### Configure & Deploy the Worker

Clone the repo and `cp wrangler.toml.sample wrangler.toml`.

Configure / login with wrangler (`npx wrangler login`).

Deploy after tweaking your wrangler.toml as needed (`npx wrangler deploy`).

Note that you'll likely want to make the following change to your wrangler.toml:

```diff
name = "decap-proxy"
main = "src/index.ts"
compatibility_date = "2024-04-19"
compatibility_flags = ["nodejs_compat"]

+workers_dev = false
+route = { pattern = "decap.mydomain.com", zone_name = "mydomain.com", custom_domain = true }
```

Where `zone_name` is a domain you already host on cloudflare for DNS, and `pattern` is the subdomain you've chosen (if different).

Disabling `workers_dev` is how you disable the default workers.dev preview domain, if that's something you want.

#### Configure OAuth Secrets

Using the OAuth application credentials you saved from the first section, you'll enter these as `GITHUB_OAUTH_ID` and `GITHUB_OAUTH_SECRET` secret values for your worker (nested under: `Compute (Workers) > Workers & Pages` > `Your Worker (decap-proxy)` > `Settings` > `Variables and Secrets` > `+ Add` and change the type to **Secret**).

Alternatively, you can also add secrets via Wrangler:

```bash
npx wrangler secret put GITHUB_OAUTH_ID
npx wrangler secret put GITHUB_OAUTH_SECRET
```

### Point to Proxy in Decap Config

Add the `base_url` for your proxy to the backend section of Decap's `config.yml`:

```diff
site_url: https://your-site-powered-by-decap.com
search: false
backend:
  name: github
  branch: main
  repo: "github-user/repo"
+  base_url: https://decap.mydomain.com
```
