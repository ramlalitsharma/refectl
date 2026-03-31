# Refectl Ecosystem Deployment Guide

This guide explains how to create new Refectl products as separate projects, host them safely, connect them to `refectl.com`, and keep the whole ecosystem fast, secure, and maintainable.

## Recommended strategy

Keep the current project as the main brand website.

Build new heavy products as separate projects:

- `www.refectl.com` -> main website
- `games.refectl.com` -> games platform
- `forge.refectl.com` -> Forge IDE
- `shop.refectl.com` -> software tools / Forge Shop
- `api.refectl.com` -> shared backend services later

This is the best path because:

- the main site stays lighter and safer
- heavy products can scale separately
- deployments become easier
- failures in one product do not break the whole platform
- security boundaries are cleaner

## Do not do this

Avoid putting all future heavy systems into the current main project long-term.

That usually causes:

- slow builds
- large bundles
- more crashes
- harder debugging
- more security risk

## Domain strategy

Use one main domain and product subdomains.

Recommended:

- `refectl.com` or `www.refectl.com` as the main brand
- `games.refectl.com`
- `forge.refectl.com`
- `shop.refectl.com`

Do not buy separate domains for each core product right now unless:

- you want brand protection
- you want typo redirects
- the product becomes its own brand later

If you buy extra domains, use them as redirects:

- `refectlgames.com` -> `https://games.refectl.com`
- `refectlforge.com` -> `https://forge.refectl.com`

## Best project structure

For now, the easiest path is:

- keep the current website in the current repo
- create each major new product as a separate repo and deployment

Recommended repos:

- `refectl-web`
- `refectl-games`
- `refectl-forge`
- `refectl-shop`

Later, if needed, these can be combined into a monorepo.

## Hosting recommendation

### Main website

Host on Vercel:

- best fit for Next.js
- easy custom domain setup
- fast deployments

### Forge IDE

Start on Vercel if it is mainly frontend-heavy.

If Forge later needs:

- secure code execution
- isolated runtime sandboxes
- long-running tasks

then move those backend workers to a separate service such as:

- Railway
- Render
- Fly.io
- custom VPS / container platform

### Games platform

Start with:

- frontend on Vercel
- database / Redis on managed services

If realtime multiplayer becomes heavier, move the live game backend to:

- Railway
- Fly.io
- Render
- Node container platform with Redis

### APIs

Shared APIs can be:

- inside each product initially
- split later into `api.refectl.com` once the ecosystem grows

## How to create a new separate project

Example: creating `forge.refectl.com`

### 1. Create a new GitHub repo

Recommended repo name:

- `refectl-forge`

### 2. Create the new app locally

Example with Next.js:

```powershell
mkdir refectl-forge
cd refectl-forge
npx create-next-app@latest .
git init
git add .
git commit -m "Initial Forge app"
git branch -M main
git remote add origin https://github.com/<your-org-or-user>/refectl-forge.git
git push -u origin main
```

### 3. Deploy the new repo

Recommended:

- import the repo into Vercel
- let Vercel create the first deployment
- first test it on the generated preview domain

Example preview domain:

- `refectl-forge.vercel.app`

### 4. Connect the custom subdomain

In Vercel:

- open the project
- go to `Settings -> Domains`
- add `forge.refectl.com`

Then add the DNS record in your DNS provider.

Typical DNS record:

- `CNAME`
- name: `forge`
- target: Vercel target value shown in dashboard

Repeat the same model for:

- `games.refectl.com`
- `shop.refectl.com`

## DNS management

Use one DNS provider for everything.

Recommended setup:

- registrar: where you bought `refectl.com`
- DNS manager: Cloudflare or the same registrar if simple

Suggested records:

- `@` -> main root domain
- `www` -> main site
- `games` -> games app
- `forge` -> forge app
- `shop` -> shop app

Keep production DNS explicit.

Do not overuse wildcards unless you need preview environments.

## How to link product apps back to the main site

From the main website:

- add navbar links
- add landing page cards
- add product CTAs
- add footer links

Example:

```tsx
const ecosystemLinks = [
  { label: 'Games', href: 'https://games.refectl.com' },
  { label: 'Forge', href: 'https://forge.refectl.com' },
  { label: 'Forge Shop', href: 'https://shop.refectl.com' },
];
```

Use absolute URLs when linking across different product apps.

## How to link back from sub-products

Each separate product should also link back to the main website:

- logo -> `https://www.refectl.com`
- “Home” in the nav
- “Explore Products”
- “Pricing” or “About”

This keeps the ecosystem connected and helps users move between apps naturally.

## Shared branding rules

Even though apps are separate, keep these shared:

- logo
- color system
- typography
- navigation language
- auth style
- button system

The user should feel:

- one brand
- multiple specialized products

## Authentication strategy

Best long-term direction:

- one login system across all subdomains

That means:

- a user logs in once
- the same account works on website, games, forge, and shop

Good options:

- Clerk
- Auth.js with shared domain/session strategy
- custom auth service later

For now:

- each app can start with the same auth provider
- later unify shared sessions and account routing

## Data strategy

Recommended:

- allow each product to own its own product-specific data
- share only the core account and billing data where needed

Example:

- main site -> profiles, marketing, subscriptions
- games -> rooms, scores, leaderboards
- forge -> workspaces, AI history, editor preferences
- shop -> listings, purchases, licenses

## Security strategy

This separation is especially important for:

- Forge IDE
- AI tools
- terminal-like systems
- multiplayer rooms

Benefits:

- less blast radius
- safer secrets management
- easier rate limiting
- easier monitoring

Guidelines:

- use separate env vars per project
- do not share all secrets across all apps
- isolate sensitive backend workloads
- keep code execution away from the main website app

## Performance strategy

Separate projects improve performance because:

- each app ships only what it needs
- games do not bloat the main site bundle
- Monaco/editor code does not slow normal pages
- deployment builds are smaller

## Release workflow recommendation

For each new product:

1. create repo
2. deploy to preview domain
3. test basic product flow
4. attach custom subdomain
5. add links from main site
6. add analytics
7. add monitoring
8. launch publicly

## Best order for Refectl

Recommended rollout:

1. keep current project as the main site
2. build `forge.refectl.com` as a separate project
3. build `games.refectl.com` as a separate project
4. build `shop.refectl.com` once the marketplace becomes large enough
5. introduce shared auth and shared API services after that

## Suggested naming standard

Use consistent product naming:

- `Refectl`
- `Refectl Games`
- `Refectl Forge`
- `Refectl Shop`

Technical naming:

- `refectl-web`
- `refectl-games`
- `refectl-forge`
- `refectl-shop`

Domain naming:

- `www.refectl.com`
- `games.refectl.com`
- `forge.refectl.com`
- `shop.refectl.com`

## Practical recommendation for right now

Do this now:

- keep the current project untouched as the main site
- create each new heavy product as a separate project
- host each on its own subdomain
- link them together using the Refectl brand system

This gives the best balance of:

- speed
- security
- performance
- future scalability

## Simple decision summary

Use:

- same main brand domain
- separate product subdomains
- separate deployments
- shared branding
- shared auth later

Avoid:

- one giant codebase for everything
- multiple unrelated brand domains for core products
- coupling the main site to heavy runtime products

## Quick checklist

- [ ] Keep current project as `refectl.com` main website
- [ ] Create new repo for Forge
- [ ] Deploy Forge
- [ ] Connect `forge.refectl.com`
- [ ] Create new repo for Games
- [ ] Deploy Games
- [ ] Connect `games.refectl.com`
- [ ] Add product links on the main site
- [ ] Unify auth later
- [ ] Add shared design system later

