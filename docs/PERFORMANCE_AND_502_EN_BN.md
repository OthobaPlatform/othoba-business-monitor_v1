# Bulk upload optimization and 502 recovery / দ্রুত upload ও 502 সমাধান

Read sections 18–19 in [the bilingual installation guide](INSTALLATION_EN_BN.md), also available as Word in this folder. This release is 2.1.0, prepared 1 November 2026.

## Upgrade / আপগ্রেড

1. Back up both sales/auth SQLite databases and preserve backend/config.json. Stop the existing Node service.
2. Replace SalesDashboard, backend code, frontend-src and scripts as one release. Preserve the production config and existing private dataDir. Do not overwrite live data with an empty directory.
3. Restart the one Node service. Run node scripts/diagnose.mjs from the package root. Hard-refresh the browser.
4. Verify historical dates/totals, sign in as admin, create a Viewer at the bottom of Daily Upload, and check that the viewer can copy/download but cannot upload or restore.

বাংলা: sales/auth database ও config backup নিন। Node service বন্ধ করে app folder একসঙ্গে বদলান। পুরনো production config ও dataDir রাখুন। একটি Node service চালান, diagnose চালিয়ে browser hard refresh করুন। history ও viewer permission মিলিয়ে দেখুন।

## Measured fixture / পরীক্ষার ফল

A same-machine, single-run comparison used 70 synthetic CSVs with 1000 rows each (70000 rows). Both packages used the same synchronous API test harness to compare processing overhead without browser polling delays.

| Operation | Previous package | Release 2.1 |
| --- | --- | --- |
| Scan 70 CSVs | 1973 ms | 1236 ms |
| Preview and commit | 2345 ms | 272 ms |
| First compressed shared download | 1152 ms | 251 ms |

A separate asynchronous regression test also verified that health and authenticated session endpoints respond during snapshot work, with cached shared downloads reused. These are synthetic local measurements, not production SLAs. Network, unique text cardinality, real file width, annual row count, simultaneous administrators and browser RAM change the result.

বাংলা: একই পরিবেশে ৭০টি synthetic CSV, মোট ৭০,০০০ line দিয়ে পরীক্ষা করা হয়েছে। এটি আপনার server এর speed guarantee নয়। network, unique text, column/row সংখ্যা, concurrent admin ও browser RAM অনুযায়ী সময় বদলাবে। বাস্তব dump দিয়ে পুনরায় test করুন।

The backend optimizes reporting fields and preserves row multiplicity and source CSV bytes. It does not erase legitimate sales rows, simplify distinct-order counting, remove historical dates or merge competing versions. The browser still holds loaded reporting history for interactive filters and full offline exports; unlimited files cannot have constant load time. The default file limit is 20 MB and compact incoming preview budget is 512 MB per batch; these are configurable. A budget rejection is shown as a file-level validation result and leaves committed history intact.

বাংলা: optimizer report এর প্রয়োজনীয় field compact করে; আসল item line, order counting, historical date বা original source মুছে ফেলে না। browser interactive report ও offline export এর জন্য loaded history রাখে। সীমাহীন data তে একই loading time সম্ভব নয়। default CSV limit ২০ MB ও compact preview budget ৫১২ MB; সীমা পার হলে কারণসহ file error দেখায়, committed history থাকে।

## Diagnose 502 / 502 পরীক্ষা

Run node scripts/diagnose.mjs directly on the hosting server. If direct backend health fails, check/start the Node service, logs, port, data-directory permissions and memory. If backend health succeeds while the website fails, check IIS ARR/URL Rewrite or Nginx and its logs. Capture the IIS status/substatus and Win32 code when applicable. Background job requests reduce dependence on one long proxy request; they cannot repair an offline or misconfigured backend.

বাংলা: hosting server এ diagnose কমান্ড দিন। backend health না এলে Node service, log, port, data permission ও memory দেখুন। direct backend ঠিক কিন্তু website 502 হলে IIS/Nginx proxy route ও log দেখুন। নতুন job system দীর্ঘ request এ নির্ভরতা কমায়; বন্ধ বা ভুলভাবে configured backend নিজে ঠিক করতে পারে না।

Microsoft ARR troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/developer/webapps/iis/application-request-routing/troubleshooting-502-errors-in-arr
