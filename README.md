# decap-proxy

A Cloudflare Worker OAuth proxy for [Decap CMS](https://github.com/decaporg/decap-cms). This allows for deploying Decap without the Netlify Identity or Git Gateway services.

This proxy is intended to be deployed on its own subdomain, separate from whatever website domain you're using Decap with.

## Configuring & Deploying the Worker

Clone the repo and `cp wrangler.toml.sample wrangler.toml`.

Configure / login with wrangler (`yarn global add wrangler && wrangler login`).

Deploy after tweaking your wrangler.toml as needed (`yarn deploy`).

Note that you'll likely want to make the following change to your wrangler.toml:

```diff
name = "decap-proxy"
main = "src/index.ts"
compatibility_date = "2024-04-19"
compatibility_flags = ["nodejs_compat"]

+workers_dev = false
+route = { pattern = "my.domain.com", zone_name = "my.domain" }
```

Where `zone_name` is a domain you already host on cloudflare for DNS, and `pattern` is the subdomain you've chosen (if different). You'll also likely need to login to the Cloudflare admin site and configure the custom domain for your worker so that the DNS record is added (nested under: `Workers & Pages` > `Your Worker (decap-proxy)` > `Settings` > `Triggers` > `Add Custom Domain`).

## Usage with Decap

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
