# Why /admin works on localhost but not on your domain

Your app is a **Single Page Application (SPA)**. Routes like `/admin` exist only in the browser—there is no real file at `/admin` on the server.

- **Localhost:** The dev server (Vite) is set up to serve `index.html` for every path, so `/admin` works.
- **Domain:** The live server looks for a file at `/admin`. It doesn’t exist, so you get **404 Not Found** unless the host is configured to send all routes to `index.html`.

Fix: configure your **hosting** so that all (or relevant) paths serve `index.html`. Then the app loads and the client-side router can show the admin page.

---

## Firebase Hosting

Your `firebase.json` already has the right rewrite:

```json
"rewrites": [
  { "source": "**", "destination": "/index.html" }
]
```

You must **deploy** for this to apply on your domain:

```bash
npm run build
firebase deploy --only hosting
```

After deploy, open `https://your-domain.web.app/admin` (or your custom domain). If it still 404s:

1. Confirm you’re using **Firebase Hosting** for this domain (not another provider).
2. Hard refresh or try in an incognito window (cache can show old 404).
3. In Firebase Console → Hosting, check that the latest deploy is active.

---

## Netlify

A `public/_redirects` file is included so that when you build, `dist/_redirects` is created:

```
/*    /index.html   200
```

Deploy the **dist** folder (e.g. set “Publish directory” to `dist`). Netlify will use this and serve `index.html` for `/admin` and other routes.

---

## Vercel

A `vercel.json` in the project root tells Vercel to send all routes to `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Deploy as usual (e.g. `vercel` or Git integration). `/admin` will then work on your domain.

---

## Other static hosts (e.g. GitHub Pages, S3)

If the host doesn’t support rewrites:

1. **Option A:** Use a host that does (Firebase, Netlify, Vercel).
2. **Option B:** Add a custom 404 page that is a copy of `index.html`, so any unknown path (like `/admin`) loads the app and the client router can handle it. (Exact steps depend on the host.)

---

## Quick checklist

- [ ] I’m using **Firebase Hosting** → run `npm run build` then `firebase deploy --only hosting`.
- [ ] I’m using **Netlify** → build output is `dist`, and `_redirects` is in `public/` (so it’s in `dist` after build).
- [ ] I’m using **Vercel** → `vercel.json` is in the project root and I’ve redeployed.
- [ ] Still 404 → try incognito or another browser to rule out cache.
