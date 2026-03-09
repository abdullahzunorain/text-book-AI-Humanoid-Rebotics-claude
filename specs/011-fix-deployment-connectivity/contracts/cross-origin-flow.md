# Contract: Cross-Origin Request Flow

**Feature**: 011-fix-deployment-connectivity  
**Type**: HTTP cross-origin (CORS) request/response  
**Parties**: Frontend (GitHub Pages) ↔ Backend (Railway)

## Origins

- **Frontend Origin**: `https://abdullahzunorain.github.io`
- **Backend Origin**: `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app`

## CORS Preflight Contract

For every non-simple cross-origin request (POST with JSON, or requests with cookies), the browser sends an OPTIONS preflight:

### Request (browser → backend)
```http
OPTIONS /api/chat HTTP/1.1
Host: text-book-ai-humanoid-rebotics-claude-production.up.railway.app
Origin: https://abdullahzunorain.github.io
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

### Response (backend → browser)
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://abdullahzunorain.github.io
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

**Invariants**:
- `Access-Control-Allow-Origin` MUST be the exact origin (not `*`) when credentials are included
- `Access-Control-Allow-Credentials` MUST be `true`
- `Access-Control-Max-Age: 3600` caches preflight for 1 hour

## Healthcheck Contract

### Request
```http
GET /health HTTP/1.1
Host: text-book-ai-humanoid-rebotics-claude-production.up.railway.app
```

### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status": "ok"}
```

**Timeout**: Must respond within 120 seconds (Railway healthcheckTimeout)

## Auth Cookie Contract

### Set-Cookie (backend → browser, on successful signin)
```http
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
```

### Cookie Transmission (browser → backend, on subsequent requests)
```http
POST /api/chat HTTP/1.1
Cookie: token=<jwt>
```

**Requirements**:
- `Secure` flag required (both origins are HTTPS)
- `SameSite=None` required (cross-origin cookie transmission)
- `HttpOnly` prevents JavaScript access (XSS protection)
- Frontend must use `credentials: 'include'` in fetch requests

## Chat API Contract (cross-origin)

### Request
```http
POST /api/chat HTTP/1.1
Host: text-book-ai-humanoid-rebotics-claude-production.up.railway.app
Origin: https://abdullahzunorain.github.io
Content-Type: application/json
Cookie: token=<jwt> (optional)

{"question": "What is ROS 2?", "selected_text": null}
```

### Response
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://abdullahzunorain.github.io
Access-Control-Allow-Credentials: true
Content-Type: application/json

{"answer": "ROS 2 is...", "sources": ["module-1/intro.md"]}
```
