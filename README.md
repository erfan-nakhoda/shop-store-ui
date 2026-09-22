# shop-store-ui

## API connection

Set `VITE_API_URL=/api` for same-origin browser requests. During local development,
Vite forwards `/api/*` to `VITE_API_PROXY_TARGET`, removing the `/api` prefix
(for example, `/api/product/all` becomes `/product/all` on the backend).
Restart `npm run dev` after changing these settings. Token refresh uses the same
API base URL.

For a production deployment, configure the hosting server to proxy `/api/*` to
the backend with the same prefix removal, before any SPA fallback. Vite's proxy
does not run in the deployed static build. Alternatively, set `VITE_API_URL` to
the HTTPS backend URL before building and configure that backend to allow the
exact frontend origin, credentials, methods, and request headers, including
`Authorization` and `Content-Type`.

An Apache `.htaccess` rule for fonts/CSS/JS does not configure API CORS. This
project uses credentialed API requests, which cannot use a wildcard
`Access-Control-Allow-Origin: *` response.
