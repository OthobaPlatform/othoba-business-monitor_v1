# Release 2.1.0

Prepared 1 November 2026. This release retains the Othoba blue DM Sans dashboard and all reporting, sales/target uploads, file Override/Skip, automatic refresh and offline exports.

- Direct CSV-to-compact-column parser, discarding unused CSV fields from reporting memory.
- Lazy saved-date loading during previews; no full-history copy for every administrator preview.
- Transactional partition-only commits; each source CSV compressed once per committed report.
- Shared compressed state built using temporary disk column spools and reused per revision.
- Browser state delivered as transferable compressed bytes, removing the initial base64 copy.
- Account-owned background jobs with idempotent retries and fast health/status checks.
- Admin user creation in Daily Upload; default Viewer role, backend-enforced write restrictions.
- Searchable, sortable source archive with original CSV downloads for admins/viewers.
- Configurable compact preview budget, automatic preview/temp cleanup and direct backend diagnostic script.
- Consolidated private engine copies; removed unused generated source bundle, seed folder and duplicate old font license.
- Updated bilingual installation, migration and 502 troubleshooting instructions.

The package starts empty and contains no accounts, default passwords, company CSVs or live databases. Back up and preserve your existing production config/dataDir, stop the Node service, replace application code and frontend together, then restart and hard-refresh. No destructive database migration is required.
