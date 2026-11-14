# Othoba Performance HQ Server

Version 2.1.0. Updated from the current blue DM Sans dashboard, including daily/monthly targets and file-by-file Override/Skip.

The package keeps your team's `SalesDashboard/` deployment layout and adds a central Node.js backend. All signed-in users see the same committed sales history and targets. The package starts empty and contains no accounts or default passwords.

বাংলা: এই প্যাকেজে বর্তমান blue dashboard, DM Sans, target upload এবং প্রতিটি ফাইলের Override/Skip আছে। আপনার টিমের SalesDashboard ফোল্ডার অপরিবর্তিত রাখা হয়েছে। সবার জন্য একটি কেন্দ্রীয় backend ও database থাকবে। শুরুতে কোনো sales, target বা user account নেই।

## Start here

1. Read [the full English and Bangla guide](docs/INSTALLATION_EN_BN.md), or the Word guide in `docs/`.
2. Choose [Windows Server and IIS](docs/IIS_DEPLOYMENT.md), [Linux](docs/LINUX_DEPLOYMENT.md), or [macOS](docs/MACOS_DEPLOYMENT.md).
3. Install a maintained Node.js 24 LTS release, version 24.14 or newer within 24.x. No npm dependencies are required.
4. Configure the private data directory and exact browser origin.
5. Create the first administrator and start the backend. Create additional accounts at Daily Upload → User access management, or use the setup CLI.
6. Open the dashboard through the configured address, import history, reconcile totals and test recovery.

## Local first test

Run these in the package root. On Windows use `Copy-Item` instead of `cp`.

```sh
cp backend/config.local.example.json backend/config.json
node backend/setup.mjs
node backend/server.mjs
```

Open `http://localhost:3011`. After signing in as admin, create viewer accounts at the bottom of Daily Upload. The CLI alternative is `node backend/setup.mjs --add-user`. Passwords are entered through hidden interactive prompts. Stop the foreground test with Ctrl+C before enabling an OS service.

বাংলা: মূল ফোল্ডারে উপরোক্ত কমান্ড দিন। Admin login করে Daily Upload এর নিচে viewer তৈরি করতে পারেন। ব্রাউজারে ঠিক localhost ঠিকানাটি ব্যবহার করুন। production service চালানোর আগে foreground server বন্ধ করুন।

## Deployment layout

- `SalesDashboard/`: public frontend with hashed JS/CSS, logo, DM Sans, manifest and IIS configuration.
- `backend/`: accounts, API, SQLite, preview processing and offline export template.
- `frontend-src/`: editable dashboard source, server bridge and styles.
- `scripts/`: frontend build, startup, Linux systemd, macOS launchd and Nginx examples.
- `templates/targets/`: eight CSV target upload templates.
- `tests/`: authenticated integration tests with synthetic data.
- `docs/`: complete installation, operations, API and validation notes.

Only publish `SalesDashboard/`, or let Node serve that directory. Keep `backend/` and the database private. Production uses HTTPS through IIS or Nginx and loopback port 3011 for Node. Use one Node process and local-disk SQLite storage.

## Current behavior

- Both daily CSV streams and historical bulk backfills.
- Current saved-row verification, exact/normalized duplicate detection and file-level Override/Skip.
- Whole stream/date replacement; no double counting or silent union of incomplete versions.
- Admin-only previews and commits with revision conflict protection.
- KAM, Seller, Category 1–5 and Vertical daily/monthly targets. Vertical currently matches Business Unit.
- Modern multi-view reporting, searchable filters, sorting, copy and CSV exports.
- Shared target and sales history retained after restart; viewer refresh checks every 15 seconds.
- Full HTML exports with all loaded committed history and targets. The export is an offline snapshot, not a live link.
- JSON migration/restore, scheduled local SQLite backups and manual backups.
- Password setup/reset, account disabling and session revocation.

## Source and checks

```sh
npm run build
npm test
node backend/backup.mjs
```

The build is already included. Rebuild after source changes. Preserve your private data directory and `backend/config.json` during upgrades. The new schema retains earlier report/account tables and adds planning/import/audit records. The old frontend/API must be replaced as one release.

Integration tests passed on Linux with Node.js 24.22.1. Windows IIS and macOS launchd procedures are supplied for your team to validate on the actual servers. This ZIP has not been deployed to your company's server.

## Faster bulk uploads and the 502 fix

Read [the optimization and upgrade notes](docs/PERFORMANCE_AND_502_EN_BN.md) before replacing an existing deployment. Keep your current private database and production configuration; replace the application folders together and hard-refresh the browser. Do not install the sample configuration over your production config.

- Sales previews load saved data only for affected stream/date partitions.
- CSVs are parsed directly into dictionary-coded columns; unused CSV fields are discarded from reporting memory.
- Commits write only selected partitions. Shared downloads are built with temporary disk column spools, rather than a full in-memory historical merge.
- Long operations use short, account-owned background jobs with idempotent retry IDs.
- Admins create viewer/admin accounts in Daily Upload. Viewers can copy/export reports, download backups/HTML and original committed CSVs; uploads and restores remain admin-only.
- `node scripts/diagnose.mjs` checks the backend directly. A 502 still needs proxy/service log investigation on your server.

বাংলা: পুরনো data ও config রেখে নতুন app deploy করুন। Daily Upload এর নিচে admin নতুন viewer তৈরি করতে পারবেন। viewer report copy/download ও original CSV download করতে পারবেন, upload/restore পারবেন না। বড় batch background job এ চলে; শুধু পরিবর্তিত date save হয়। 502 হলে diagnose কমান্ড এবং server/proxy log পরীক্ষা করুন।
