# API reference

All API paths are relative to the configured application root. Authentication uses an HttpOnly SameSite Strict session cookie. HTTPS uses Secure cookies. State-changing requests require the exact allowed Origin and the X-CSRF-Token returned by login/me. Do not put passwords or tokens in URLs or logs.

## Sessions and state

- POST `/api/login`: `{username,password}`. Returns user, role, CSRF token and expiry. Sets the session cookie.
- GET `/api/me`: current user and CSRF token. Requires authentication.
- POST `/api/logout`: revoke the current session.
- GET `/api/health`: startup readiness and application version; no sales data.
- GET `/api/status`: revision, instanceId, update time, row/date coverage and target record count.
- GET `/api/state`: raw gzip bytes containing the current packed sales, imports, targets and targetImports. Content-Type is application/octet-stream; it is not an automatically decoded gzip response. ETag and X-Othoba-Revision/X-Othoba-Instance describe the same snapshot. If-None-Match supports 304.
- GET `/api/offline-template`: standalone template, transmitted with HTTP gzip encoding and automatically decoded by normal browser fetch.

## Sales import batches

Admin only. Use a new batch id after revision changes or preview expiry.

1. POST `/api/imports/batch/start`, `{}` -> `{id,baseRevision,expiresAt}`.
2. POST `/api/imports/batch/file`, `{batchId,filename,text,type:"auto"}` for each file.
3. POST `/api/imports/batch/operation`, `{batchId,operation,payload}`.
4. POST `/api/imports/batch/commit`, `{batchId,expectedRevision:baseRevision}`.
5. POST `/api/imports/batch/discard`, `{batchId}` to abandon a preview.

Operations: bulkPreview, bulkReport, bulkChoose, bulkPolicy, bulkFileAction. The last operation uses `{fileId:"f0",action:"override"}` or `{fileId:"f0",action:"skip"}`. `bulkChoose` uses `{key:"gross|2026-09-01",choice:"candidate-id"}` or `skip`. `bulkPolicy` uses `{mode:"latest"}` or `{mode:"skip"}` for unresolved dates. Invalid CSV files remain visible in results and cannot be overridden into the database.

The commit revalidates the actor and revision, calculates the selected next state on the server, updates chosen stream/date partitions in one SQLite transaction, records source metadata and increments the revision. Whole-file duplicate detection never prevents an explicit Override. A replacement does not append duplicate day rows.

## Target batches

Admin only. Same start/file/operation/commit/discard structure under `/api/targets/batch/`.

Target file body: `{batchId,filename,text,scope,cadence}`. Scope is kam/seller/category/vertical; cadence is daily/monthly. Operation is targetPreview. Target changes are persisted centrally and increment the same shared revision as sales changes.

## Backup restore

Admin only. POST `/api/backups/preview`, `{text:"JSON backup text"}` -> `{id,baseRevision,rows,dates,targets}`.

POST `/api/backups/commit`, `{batchId:id,expectedRevision:baseRevision}`. Replaces all shared reporting history and targets; preserves user accounts. The server saves a pre-restore sales database copy first. The UI shows an explicit confirmation. This endpoint is not an additive merge.

## Errors and boundaries

401 unauthenticated; 403 role/origin/CSRF denied; 404 preview missing or owned by another account; 409 REVISION_CONFLICT; 413 body/file too large; 429 sign-in or preview capacity limit. Invalid report files are isolated in their batch result; malformed API requests receive an error response.

One active preview per account, default 60 idle minutes and 1500 files maximum per batch. The server defaults to 8 simultaneous account previews. New previews under an account replace that account's earlier preview. Viewer API permissions are enforced on the backend, not only by hiding buttons.

## Version 2.1 background jobs (preferred by the online frontend)

Use `?async=1` and a unique UUID `requestId` on imports/targets batch POSTs and backup preview/commit. These return HTTP 202 and `{id,state}` immediately. Poll GET `/api/jobs/{id}` using the same session. Complete jobs return `{state:"complete",result}`. Failed jobs return `{state:"failed",status,error,code}`. Jobs are account-owned, retained for 30 minutes after completion, with at most 8192 receipts. Pending job errors do not become unhandled request rejections. Reusing the exact request ID and payload retrieves the same job; changing its operation or payload returns 409. Do not generate a new ID for a network retry. A server restart clears jobs/previews; check committed history before a fresh batch.

POST `/api/state/prepare?async=1` with `{requestId}` is available to both roles and requires Origin/CSRF. It creates/reuses the current compressed snapshot through a job. Result includes a relative `download` URL. GET that URL with the same account; it does not reveal disk paths. A 409 download response means the snapshot was superseded; prepare again. GET `/api/state` remains for existing API clients, but may be long-running on a cold cache. The online frontend uses the job route.

GET `/api/status` uses the most recently committed worker status, so it does not wait behind a snapshot. GET `/api/health` and session/account checks remain responsive independently of the data worker queue. GET `/api/diagnostics` is admin-only and returns readiness, queue length, process RSS and uptime.

GET `/api/users` is admin-only and returns username, role, active status and creation timestamp. POST `/api/users` is admin-only with Origin/CSRF and `{username,password,role}`. Default role is viewer. Usernames are normalized to lowercase; duplicate/invalid usernames, invalid roles and passwords shorter than 12 or longer than 256 characters are rejected. Neither endpoint returns password hashes. CLI reset/disable remains supported.

POST `/api/reports/list?async=1` is read access for both roles with Origin/CSRF: `{requestId,search,page,sort,direction}`. The source archive returns 50 entries/page; sort whitelist is filename/rows/importedAt and direction asc/desc. This archive includes replaced versions and is not a sales fact table.

POST `/api/reports/download?async=1`: `{requestId,hash}` prepares an original committed CSV, when retained. Its job result includes a private account-owned download route. GET responds with CSV attachment and HTTP gzip encoding. A JSON-only restore cannot recreate missing original CSV bytes.

Incoming previews default to a 512 MB compact-column budget, configurable with maxPreviewMB. This is not a process-RAM hard limit. When exceeded, the offending file is invalidated with an explanation; accepted preview files can still be saved. Per-file maxCsvMB still applies. Snapshot work uses temporary column spools and streams gzip; no full-history merged Store is allocated by the backend download path.
