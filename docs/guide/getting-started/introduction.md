---
title: Introduction
group: Getting Started
children:
  - ./installation.md
---

# Introduction

`@zitadel/qwik-auth` is an open source library that provides authentication
for Qwik City applications. It wraps auth
(`@auth/core`) to bring OAuth, credentials, and magic-link authentication to
Qwik with a native developer experience.

Through a direct integration into Qwik City's request handlers and
`routeLoader$`, you can access and utilize user sessions within your routes
and components directly.

## Features

### Authentication providers

- OAuth (eg. GitHub, Google, Twitter, Azure...)
- Custom OAuth (Add your own!)
- Credentials (username / email + password)
- Email Magic URLs

### Application Side Session Management

- Session fetching via `useSession` route loader
- Server-side signIn / signOut via `useSignIn$` / `useSignOut$` global
  actions
- Full TypeScript support for all methods and properties

### Application protection

- Request handler protection via `event.sharedMap.get('session')`
- Plugin-based session population in `routes/plugin@auth.ts`
- Server-side session access in any `routeLoader$` / `routeAction$`
