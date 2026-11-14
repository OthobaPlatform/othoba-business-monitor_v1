# Validation for release 2.1

Runtime tested: Linux, Node.js 24.22.1. Data: synthetic reports; no user historical dump or live company server was used.

Passed authenticated HTTP integration checks:
- Admin/viewer accounts, wrong-origin rejection, CSRF rejection, logout and session expiry checks.
- Empty central dataset and two independent viewer sessions reading the same commits.
- Scan/discard without persistence, normal gross/delivered imports and complete date replacement.
- Exact saved duplicates with explicit Override and Skip; current saved-row verification of old hashes.
- Overlapping versions, invalid-file isolation, private batch ownership and two-admin revision conflicts.
- Daily/monthly targets for KAM, Seller, Category and Vertical, preserved in snapshots and restores.
- ETag 304, authenticated standalone template, private file path protection and packed export decoding.
- Server restart persistence, manual SQLite snapshots, scheduled startup backups and integrity_check.
- Upgrade from the previous schema layout and retention of the shared revision.
- 29 historical dates in one backfill, duplicate copy skipping and partial multi-date override decisions.

The shared standalone import engine also passed its 432-file / 216000-line regression scenario, target validation, exact/reordered duplicates, repeated line multiplicity, incomplete coverage and compressed export round trips.

Browser checks: current standalone file-level controls and the online sign-in screen rendered in the managed preview. Authenticated online workflows were verified through HTTP integration tests. The team must complete the authenticated browser acceptance checklist on its own hosted environment. Windows IIS and macOS launchd were not executed in this Linux environment.

Run `npm test` to repeat the included server suite. The source engine scenarios are described in the bilingual guide. Runtime timing in the build environment is not a production performance guarantee. Reconcile real historical totals before executive use.

## Release 2.1 added validation

All nine included integration tests passed on Linux Node.js 24.22.1 after the final engine/backend changes. Added checks cover admin UI user creation API, new viewer sign-in, backend denials for every write family, password/hash handling, asynchronous job ownership, changed-payload rejection, exact retry reuse, source archive search and original CSV byte download, compact parser parity with the prior normalization, Unicode/quoted fields, negative/decimal/large numeric values, high-cardinality dictionaries, repeated row preservation, reordered normalized duplicates and the configured preview budget.

The 430-file historical selection test stages 430 distinct-date reports plus one duplicate and one invalid file (432 selected files), commits 4300 lines without overlap blocking, and verifies diagnostic health. A separate 70-file test imports 70000 lines, checks health/session responsiveness during a cold snapshot, cache reuse, correction of only one saved date and restart persistence. The same test passed with OTHOBA_TEST_ROWS_PER_FILE=5000: 350000 lines, scan 6147 ms, commit 1310 ms, cold snapshot 1089 ms, warm preparation 17 ms, process RSS about 342 MB. These figures include test-host effects and are not hardware sizing guarantees.

For a repeatable larger check:

```sh
OTHOBA_TEST_ROWS_PER_FILE=5000 node --test --test-name-pattern=70-file tests/server.test.mjs
```

On PowerShell set `$env:OTHOBA_TEST_ROWS_PER_FILE = '5000'` before the node command. On macOS/Linux the above prefix syntax works. The default npm test runs all tests with the 70000-line fixture.

The new account panel was rendered in the browser with synthetic placeholder accounts for visual inspection. Authenticated account/import/export workflows were verified with HTTP integration tests. Native IIS/launchd and the company's real CSV corpus remain deployment acceptance tasks. The screenshot's exact 502 trigger cannot be established without hosting logs; the package includes direct-backend diagnosis and short-job processing to address the identified code bottlenecks.
