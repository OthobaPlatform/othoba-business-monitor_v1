# Othoba Performance HQ Server Installation Guide

Version 2.1.0  |  1 November 2026

This guide is for Othoba's developers and server administrators. It installs the updated blue dashboard with DM Sans, central sales history, daily and monthly targets, file-by-file Override and Skip, shared exports and accounts. Start with a private test installation, verify totals, then use your company's server address. The ZIP is deployable source; it is not an already deployed service.

বাংলা নির্দেশনা: এই গাইড Othoba এর ডেভেলপার ও সার্ভার অ্যাডমিনের জন্য। এতে নতুন নীল ডিজাইনের ড্যাশবোর্ড, কেন্দ্রীয় বিক্রয় তথ্য, দৈনিক ও মাসিক টার্গেট, প্রতিটি ফাইলের Override ও Skip, ইউজার অ্যাকাউন্ট এবং ব্যাকআপসহ সম্পূর্ণ ইনস্টলেশন দেখানো হয়েছে। আগে পরীক্ষামূলকভাবে চালিয়ে তথ্য মিলিয়ে নিন। তারপর অফিসের সার্ভারে চালু করুন। ZIP ফাইল দেওয়া মানেই সার্ভারে সিস্টেম চালু হয়ে গেছে এমন নয়।

## 1 Package and hosting model

Keep the folder names `SalesDashboard`, `backend`, `frontend-src`, `scripts`, `tests`, `templates` and `docs`. `SalesDashboard` is the public deployment folder already used by your team. The backend is a separate Node.js process. All viewers use the same backend database. The initial package contains no sales data, target data, user account or default password.

বাংলা: ফোল্ডারের নাম পরিবর্তন করবেন না। `SalesDashboard` আপনার টিমের বর্তমান পাবলিক ডিপ্লয়মেন্ট ফোল্ডার। `backend` এ Node.js সার্ভার চালু থাকবে। সবাই একই সার্ভারের ডেটাবেস থেকে তথ্য দেখবে। নতুন প্যাকেজে বিক্রয় তথ্য, টার্গেট বা তৈরি করা ইউজার নেই। কোনো ডিফল্ট পাসওয়ার্ড দেওয়া হয়নি।

| Folder or file | Purpose |
| --- | --- |
| SalesDashboard | Public HTML CSS JavaScript logo and fonts |
| backend | API authentication SQLite and import processing |
| backend/data | Default private database cache staging and backups |
| frontend-src | Editable dashboard code and server bridge |
| scripts | Build Linux service macOS service and proxy examples |
| templates/targets | Eight blank target CSV templates |
| tests/server.test.mjs | Authenticated server integration tests |
| docs | English and Bangla installation and operations material |

Use one running Node process with a local-disk SQLite database. Do not run multiple copies against the same live data folder, and do not place the database on a network share. Use IIS or Nginx for the public HTTPS address. Keep the Node port on loopback in production.

বাংলা: একই ডেটা ফোল্ডারের জন্য একটি Node প্রসেস চালান। একই ডেটাবেস একসঙ্গে একাধিক সার্ভার প্রসেসে চালাবেন না এবং নেটওয়ার্ক শেয়ারে SQLite ফাইল রাখবেন না। পাবলিক HTTPS ঠিকানার জন্য IIS বা Nginx ব্যবহার করুন। প্রোডাকশনে Node সার্ভার `127.0.0.1` এ রাখুন।

## 2 Requirements and verification limits

Use a maintained Node.js 24 LTS release, at least 24.14 within the 24.x series. Node 25 and other major versions are outside this package's tested runtime. No npm packages, SQL Server installation, paid service or external analytics subscription is needed. Built-in `node:sqlite` stores the records. A modern desktop Chrome or Edge is suitable for large CSV backfills.

বাংলা: Node.js 24 LTS এর 24.14 বা তার পরের 24.x সংস্করণ ব্যবহার করুন। এই প্যাকেজ Node 25 বা অন্য মেজর সংস্করণের জন্য পরীক্ষা করা হয়নি। আলাদা npm প্যাকেজ, SQL Server বা পেইড সাবস্ক্রিপশন লাগবে না। বড় CSV আপলোডের জন্য হালনাগাদ Chrome বা Edge ব্যবহার করুন।

Allow an initial 2 CPU cores and 8 GB RAM for testing, then size against your actual CSV volume and concurrent users. Keep enough disk space for the live database, retained compressed source reports, previews, exports and backup copies. One year of data has no fixed memory or load-time guarantee because row counts vary.

বাংলা: পরীক্ষার জন্য প্রথমে ২ কোর CPU ও ৮ GB RAM ধরতে পারেন। আসল ফাইলের আকার, রেকর্ড সংখ্যা ও ইউজারের সংখ্যা দেখে বাড়ান। লাইভ ডেটাবেস, সংকুচিত সোর্স ফাইল, আপলোড প্রিভিউ, এক্সপোর্ট এবং ব্যাকআপের জন্য পর্যাপ্ত ডিস্ক রাখুন। এক বছরের ডেটা কত দ্রুত লোড হবে তা রেকর্ডের সংখ্যার ওপর নির্ভর করবে।

Integration tests ran on Linux with Node.js 24.22.1. They verify accounts, shared state, import decisions, concurrent administrators, targets, persistence, exports and database integrity. The sign-in screen was checked in a browser. Native Windows IIS and macOS launchd deployment must be accepted by your team on those actual systems.

বাংলা: Linux এবং Node.js 24.22.1 এ সার্ভার ইন্টিগ্রেশন পরীক্ষা করা হয়েছে। ইউজার, শেয়ার করা ডেটা, Override ও Skip, একাধিক অ্যাডমিন, টার্গেট, রিস্টার্টের পর তথ্য এবং ব্যাকআপ পরীক্ষা করা হয়েছে। ব্রাউজারে লগইন পেজও দেখা হয়েছে। আপনার টিমকে আসল Windows IIS এবং macOS সার্ভারে চূড়ান্ত পরীক্ষা করতে হবে।

## 3 Local first run on any operating system

Extract the ZIP. Open Terminal or PowerShell in `Othoba_Performance_Server`, where `package.json` is located. Confirm the runtime. You can use `node` directly if npm is unavailable.

বাংলা: ZIP খুলে `Othoba_Performance_Server` ফোল্ডারে Terminal বা PowerShell চালু করুন। এই ফোল্ডারেই `package.json` আছে। আগে Node এর সংস্করণ দেখুন। npm না থাকলেও সরাসরি `node` কমান্ড দিয়ে চালানো যাবে।

```text
node --version
npm --version
```

For local testing only, copy the local example. The address is exactly `http://localhost:3011`; use that hostname consistently. Do not use the HTTPS production example for this HTTP test.

বাংলা: শুধু নিজের কম্পিউটারে পরীক্ষার জন্য local example কপি করুন। ব্রাউজারে ঠিক `http://localhost:3011` ব্যবহার করুন। এই HTTP পরীক্ষায় HTTPS production config ব্যবহার করবেন না।

macOS or Linux:

```sh
cp backend/config.local.example.json backend/config.json
node backend/setup.mjs
node backend/setup.mjs --add-user
node backend/server.mjs
```

Windows PowerShell:

```powershell
Copy-Item backend\config.local.example.json backend\config.json
node backend/setup.mjs
node backend/setup.mjs --add-user
node backend/server.mjs
```

The first setup creates an administrator. The second command prompts for a role; choose `viewer` for your boss's read-only account. Passwords must be 12 to 256 characters and are entered through a hidden terminal prompt. Keep the terminal open during this first test. Open the address, sign in, and confirm the initial empty state. Stop with Ctrl+C when ready to configure production hosting.

বাংলা: প্রথম setup এ অ্যাডমিন তৈরি হবে। দ্বিতীয় কমান্ডে ইউজারের রোল চাইবে। বসের শুধু রিপোর্ট দেখার অ্যাকাউন্টের জন্য `viewer` দিন। পাসওয়ার্ড ১২ থেকে ২৫৬ অক্ষরের হতে হবে এবং টার্মিনালে টাইপ করলে দেখা যাবে না। প্রথম পরীক্ষার সময় টার্মিনাল খোলা রাখুন। ব্রাউজারে লগইন করে খালি ড্যাশবোর্ড দেখুন। প্রোডাকশন সেটআপ করার আগে Ctrl+C দিয়ে বন্ধ করুন।

Do not run `npm install`; this release has no third-party runtime dependencies. `npm run build` is needed only after source changes. The ZIP already includes built assets.

বাংলা: এই সংস্করণে বাইরের runtime dependency নেই, তাই `npm install` লাগবে না। কোড পরিবর্তন করার পর শুধু `npm run build` চালান। ZIP এ তৈরি করা frontend ফাইল আগে থেকেই আছে।

## 4 Production configuration

Copy `backend/config.example.json` to `backend/config.json` and edit it. Preserve your existing config when upgrading. Use a dedicated hostname or a properly configured virtual application. Do not expose the whole package as the web root.

বাংলা: প্রোডাকশনের জন্য `config.example.json` থেকে `config.json` তৈরি করে সম্পাদনা করুন। আপগ্রেডের সময় পুরনো config মুছবেন না। একটি নির্দিষ্ট হোস্টনেম ব্যবহার করুন। পুরো প্যাকেজকে ওয়েব রুট হিসেবে প্রকাশ করবেন না।

```json
{
  "host": "127.0.0.1",
  "port": 3011,
  "publicOrigin": "https://sales.your-company.local",
  "trustProxy": true,
  "secureCookies": true,
  "dataDir": "./data",
  "sessionHours": 8,
  "maxCsvMB": 20,
  "maxBackupMB": 256,
  "autoBackupHours": 24,
  "backupRetentionDays": 14,
  "maxPreviewBatches": 8,
  "maxPreviewMB": 512,
  "previewMinutes": 60,
  "seedIncludedReports": false
}
```

`publicOrigin` is the exact browser origin, including `http` or `https` and a nonstandard port if used. Do not add a trailing path. `dataDir` is resolved relative to `backend`; an absolute private path is preferred for production. HTTPS automatically requires secure cookies. `trustProxy` is used only for a trusted loopback reverse proxy. Changing `port` requires changing the matching IIS or Nginx upstream.

বাংলা: `publicOrigin` ব্রাউজারের ঠিকানার scheme, hostname এবং দরকার হলে port পর্যন্ত হবে। শেষে কোনো path দেবেন না। `dataDir` এর আপেক্ষিক পথ `backend` ফোল্ডার থেকে ধরা হয়। প্রোডাকশনে একটি আলাদা private absolute path দিন। HTTPS হলে secure cookie ব্যবহার হবে। Node এর `port` বদলালে IIS বা Nginx এর proxy port ও বদলাতে হবে।

`maxCsvMB` limits each CSV before JSON transport. Multiple files are sent one by one. `maxBackupMB` limits the JSON backup file itself. Proxy request limits must also allow JSON overhead; a 413 response may come from either layer. A preview expires after 60 idle minutes by default. Each administrator has one active preview. Starting another preview with the same account replaces that account's previous preview.

বাংলা: `maxCsvMB` প্রতিটি CSV এর সীমা। একসঙ্গে অনেক ফাইল বেছে নিলেও একটির পর একটি পাঠানো হয়। `maxBackupMB` JSON backup ফাইলের সীমা। Proxy তেও JSON overhead সহ যথেষ্ট request limit রাখতে হবে। ডিফল্টভাবে ৬০ মিনিট কাজ না করলে preview শেষ হয়ে যায়। প্রতি অ্যাডমিনের একটি active preview থাকে। একই অ্যাকাউন্টে নতুন preview শুরু করলে আগেরটি বাদ যাবে।

## 5 Windows Server and IIS installation

Install a supported Windows Server version, Node.js 24 LTS, IIS Static Content, URL Rewrite 2 and Application Request Routing 3. Use Microsoft installers for IIS extensions. Obtain the hostname and a valid certificate from your IT team. Copy the package to `C:\Othoba_Performance_Server` and create `D:\OthobaData` or another private local folder for data.

বাংলা: সমর্থিত Windows Server, Node.js 24 LTS, IIS Static Content, URL Rewrite 2 এবং Application Request Routing 3 ইনস্টল করুন। IIS extension এর জন্য Microsoft এর installer ব্যবহার করুন। IT টিম থেকে hostname ও বৈধ certificate নিন। প্যাকেজ `C:\Othoba_Performance_Server` এ এবং ডেটা `D:\OthobaData` এর মতো আলাদা private ফোল্ডারে রাখুন।

Open PowerShell in the package root. Set `dataDir` in `backend\config.json` to `D:\\OthobaData` using JSON escaped backslashes, or use `D:/OthobaData`. Set `publicOrigin` to the final HTTPS address. Create administrator and viewer accounts as in section 3. Run a foreground test before enabling automatic startup.

বাংলা: প্যাকেজের মূল ফোল্ডারে PowerShell খুলুন। JSON এ Windows path লিখতে backslash escape করতে হবে। সহজভাবে `D:/OthobaData` দিতে পারেন। `publicOrigin` এ চূড়ান্ত HTTPS ঠিকানা দিন। ৩ নম্বর অংশ অনুসারে অ্যাডমিন ও viewer বানান। অটোমেটিক startup করার আগে foreground এ একবার চালিয়ে দেখুন।

```powershell
Set-Location C:\Othoba_Performance_Server
node backend\server.mjs
```

In IIS Manager create a site whose physical path is only `C:\Othoba_Performance_Server\SalesDashboard`. Add the real hostname and HTTPS binding. In the server-level ARR settings open Server Proxy Settings and enable proxying. The supplied `SalesDashboard\web.config` sends `api/*` requests to `http://127.0.0.1:3011/api/*`. Keep existing response bodies and increase the ARR proxy timeout to at least 600 seconds for large migrations.

বাংলা: IIS site এর physical path শুধু `SalesDashboard` দিন। আসল hostname ও HTTPS binding যোগ করুন। সার্ভার level এর ARR settings থেকে Server Proxy Settings এ proxy চালু করুন। দেওয়া `web.config` API request গুলো Node এর 3011 port এ পাঠাবে। বড় migration এর জন্য ARR proxy timeout কমপক্ষে ৬০০ সেকেন্ড রাখুন।

Grant the IIS application pool read access only to `SalesDashboard`. Create a dedicated Windows account for Node. Give that account read access to the application code and modify access to the private data folder. The IIS worker does not need database write permission. Allow inbound HTTPS to IIS; keep port 3011 off the public firewall.

বাংলা: IIS application pool কে শুধু public frontend পড়ার অনুমতি দিন। Node এর জন্য আলাদা Windows account তৈরি করুন। ওই account কোড পড়বে এবং private data folder এ modify করতে পারবে। IIS worker কে ডেটাবেসে write permission দিতে হবে না। বাইরে থেকে শুধু HTTPS খুলুন; 3011 port public করবেন না।

Use Task Scheduler to keep Node running. Create Task, set a dedicated account, select Run whether user is logged on or not, and trigger At startup. Action: Program `C:\Program Files\nodejs\node.exe`; arguments `backend\server.mjs`; Start in `C:\Othoba_Performance_Server`. Configure restart on failure and remove the default time-based stop limit. Run the task and inspect Last Run Result. Do not keep a second foreground copy running.

বাংলা: Task Scheduler এ নতুন task তৈরি করুন। dedicated account ব্যবহার করুন, user লগইন না থাকলেও চালানোর অপশন দিন এবং At startup trigger দিন। Program এ `node.exe`, arguments এ `backend\server.mjs` এবং Start in এ প্যাকেজের ফোল্ডার দিন। ব্যর্থ হলে restart এবং নির্দিষ্ট সময় পরে বন্ধ করার limit সরিয়ে দিন। Task চালিয়ে Last Run Result দেখুন। একই সময়ে আরেকটি foreground server চালাবেন না।

Verify `https://your-host/api/health` returns `ok: true`, then sign in through IIS. Reboot the Windows server and repeat the check. A 502 usually means the Node task is stopped or the proxy port is wrong. A 500.19 usually means IIS cannot load the rewrite or configuration modules.

বাংলা: HTTPS ঠিকানার `/api/health` এ `ok: true` দেখুন। এরপর IIS ঠিকানা দিয়ে লগইন করুন। Windows restart করে আবার পরীক্ষা করুন। 502 হলে Node task বা proxy port দেখুন। 500.19 হলে IIS module ও `web.config` দেখুন।

## 6 Linux server installation

The example below uses Ubuntu or Debian conventions. Install Node.js 24 LTS from the official Node.js distribution or an IT-approved package source. Confirm `node --version` and `command -v node`. The service example assumes `/usr/bin/node`; change it to your actual absolute Node path. Install Nginx using your distribution package manager.

বাংলা: নিচের উদাহরণ Ubuntu বা Debian অনুযায়ী। অফিসিয়াল বা IT অনুমোদিত উৎস থেকে Node.js 24 LTS ইনস্টল করুন। `command -v node` দিয়ে আসল path দেখুন। service example এ `/usr/bin/node` আছে; দরকার হলে আপনার path দিন। ডিস্ট্রিবিউশনের package manager দিয়ে Nginx ইনস্টল করুন।

```sh
sudo apt update
sudo apt install nginx unzip
sudo useradd --system --home /var/lib/othoba othoba
sudo mkdir -p /opt/othoba /var/lib/othoba
sudo chown othoba:othoba /var/lib/othoba
sudo chmod 700 /var/lib/othoba
```

Extract the package contents into `/opt/othoba` so `/opt/othoba/backend/server.mjs` exists. Let root own the code; give the service account read access. Save `backend/config.json` with `dataDir` `/var/lib/othoba`, `host` `127.0.0.1`, the final HTTPS `publicOrigin`, `trustProxy` true and secure cookies true. Create accounts while using the same config and service identity.

বাংলা: প্যাকেজের ভেতরের ফাইল `/opt/othoba` তে রাখুন, যেন `/opt/othoba/backend/server.mjs` পাওয়া যায়। কোড root এর অধীনে রাখুন এবং service account কে পড়তে দিন। config এ private data path, loopback host এবং আসল HTTPS origin দিন। একই config ও service identity ব্যবহার করে account তৈরি করুন।

```sh
cd /opt/othoba
sudo -u othoba node backend/setup.mjs
sudo -u othoba node backend/setup.mjs --add-user
sudo cp scripts/othoba.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now othoba
sudo systemctl status othoba
```

The supplied service writes only to `/var/lib/othoba`; update its `ReadWritePaths` if you choose a different location. View logs with `journalctl -u othoba -n 100 --no-pager`. Never run the service as root just to resolve a permission problem; correct ownership and paths.

বাংলা: service file শুধু `/var/lib/othoba` তে লিখতে দেয়। অন্য data path দিলে `ReadWritePaths` বদলান। লগ দেখতে নিচের journalctl কমান্ড দিন। permission সমস্যা হলে ownership ও path ঠিক করুন; শুধু সমস্যা এড়াতে service root হিসেবে চালাবেন না।

```sh
sudo journalctl -u othoba -n 100 --no-pager
```

Copy `scripts/nginx-othoba.conf` into the server's Nginx site configuration. Replace the hostname and certificate paths. Its `/api/` location proxies to loopback Node; other files come from `/opt/othoba/SalesDashboard`. Enable the site using your distribution's normal method, test the configuration, then reload. If an existing site already owns the hostname, integrate the locations into that site instead of creating a duplicate listener.

বাংলা: Nginx example কপি করে hostname ও certificate path বদলান। `/api/` Node এ যাবে এবং বাকি frontend `SalesDashboard` থেকে আসবে। আপনার distribution অনুযায়ী site enable করে config test করুন, তারপর reload দিন। একই hostname এর site থাকলে সেখানেই location যোগ করুন; একই listener আবার তৈরি করবেন না।

```sh
sudo nginx -t
sudo systemctl reload nginx
curl http://127.0.0.1:3011/api/health
```

Allow HTTPS through the server and network firewall. Keep the database on local disk. Reboot and verify `systemctl status othoba`, HTTPS sign-in and a viewer's shared numbers. Set up an off-machine backup copy after the first successful import.

বাংলা: সার্ভার ও নেটওয়ার্ক firewall এ HTTPS অনুমতি দিন। ডেটাবেস local disk এ রাখুন। reboot এর পরে service status, HTTPS login ও viewer এর একই তথ্য দেখা যাচ্ছে কি না পরীক্ষা করুন। প্রথম সফল import এর পর অন্য ডিভাইসে backup রাখার ব্যবস্থা করুন।

## 7 macOS server installation

Use an always-on Mac with a stable network address. Install Node.js 24 LTS from the official macOS installer and verify its path with `command -v node`. Configure the Mac to stay awake while serving reports. A macOS user LaunchAgent stops serving after that user logs out; use the supplied system LaunchDaemon for unattended hosting.

বাংলা: সব সময় চালু থাকবে এবং স্থায়ী network address আছে এমন Mac ব্যবহার করুন। অফিসিয়াল macOS installer দিয়ে Node.js 24 LTS ইনস্টল করে path দেখুন। সার্ভার চলার সময় Mac যেন sleep না করে। User LaunchAgent লগআউটের পরে বন্ধ হতে পারে। unattended hosting এর জন্য system LaunchDaemon ব্যবহার করুন।

Ask IT to create a dedicated local account named `othoba`. Copy the package to `/usr/local/othoba`. Create private data and log folders and give the service user ownership. Set `dataDir` to `/usr/local/var/othoba` in the config and configure the final HTTPS origin.

বাংলা: IT টিমকে `othoba` নামে dedicated local account তৈরি করতে বলুন। প্যাকেজ `/usr/local/othoba` তে রাখুন। private data ও log folder তৈরি করে ওই user কে ownership দিন। config এ data path ও চূড়ান্ত HTTPS origin লিখুন।

```sh
sudo mkdir -p /usr/local/var/othoba
sudo mkdir -p /usr/local/var/log/othoba
sudo chown othoba /usr/local/var/othoba
sudo chown othoba /usr/local/var/log/othoba
sudo chmod 700 /usr/local/var/othoba
cd /usr/local/othoba
sudo -u othoba node backend/setup.mjs
sudo -u othoba node backend/setup.mjs --add-user
```

Edit `scripts/com.othoba.performance.plist`. Check the absolute Node path, application path, service username and log paths. Copy it into `/Library/LaunchDaemons`, make it root-owned and readable, then load it. In these commands the example paths are the actual installation paths; change both the plist and commands together if yours differ.

বাংলা: plist ফাইলে Node path, app path, user এবং log path ঠিক আছে কি না দেখুন। তারপর `LaunchDaemons` এ কপি করে root ownership দিন এবং load করুন। অন্য path ব্যবহার করলে plist এবং কমান্ড দুটোই পরিবর্তন করুন।

```sh
sudo cp scripts/com.othoba.performance.plist \
  /Library/LaunchDaemons/com.othoba.performance.plist
sudo chown root:wheel \
  /Library/LaunchDaemons/com.othoba.performance.plist
sudo chmod 644 \
  /Library/LaunchDaemons/com.othoba.performance.plist
sudo launchctl bootstrap system \
  /Library/LaunchDaemons/com.othoba.performance.plist
sudo launchctl print system/com.othoba.performance
curl http://127.0.0.1:3011/api/health
```

For updates, stop with `sudo launchctl bootout system/com.othoba.performance`, deploy the code without replacing data/config, then bootstrap the plist again. Logs are in `/usr/local/var/log/othoba`. If Node uses a Homebrew path such as `/opt/homebrew/bin/node`, put that exact path in the plist; launchd does not read your interactive shell profile.

বাংলা: আপডেটের আগে bootout দিয়ে service বন্ধ করুন। data/config না বদলে কোড দিন এবং আবার bootstrap করুন। লগ নির্দিষ্ট log folder এ থাকবে। Node যদি Homebrew এর path এ থাকে, plist এ সেই absolute path দিন। launchd আপনার interactive shell profile পড়ে না।

Use an IT-managed Nginx reverse proxy for HTTPS. If Homebrew is already approved and installed, `brew install nginx` can install it. Adapt `scripts/nginx-othoba.conf`: change root to `/usr/local/othoba/SalesDashboard`, and set certificate and hostname paths. Validate with `nginx -t`, then use your installed Nginx service manager. The exact config directory differs between Intel and Apple Silicon installations. Do not copy Linux systemctl commands onto macOS.

বাংলা: HTTPS এর জন্য IT পরিচালিত Nginx ব্যবহার করুন। অনুমোদিত Homebrew থাকলে এটি দিয়ে Nginx ইনস্টল করা যায়। example এ root, certificate ও hostname বদলান। `nginx -t` দিয়ে পরীক্ষা করে আপনার Nginx service manager থেকে চালু করুন। Intel ও Apple Silicon এ config directory আলাদা হতে পারে। macOS এ Linux এর systemctl কমান্ড ব্যবহার করবেন না।

Reboot the Mac and verify the daemon, HTTPS sign-in and a second computer's access. Reserve the network address in DHCP or DNS. Remember that turning off or sleeping the Mac stops access for everyone.

বাংলা: Mac reboot করে daemon, HTTPS login ও অন্য কম্পিউটার থেকে access পরীক্ষা করুন। DHCP বা DNS এ address স্থির রাখুন। Mac বন্ধ বা sleep হলে সবার dashboard access বন্ধ হবে।

## 8 Accounts and permissions

Administrators upload sales, choose Override/Skip, upload targets and restore shared history. Viewers see reports and can copy/export data and full HTML. A viewer cannot commit sales, targets or a restore through the API. Create a separate viewer account for the CEO or chairman instead of sharing the administrator password.

বাংলা: অ্যাডমিন sales upload, Override/Skip, target upload ও shared history restore করতে পারেন। Viewer রিপোর্ট দেখবেন এবং copy/export করতে পারবেন, কিন্তু API দিয়েও পরিবর্তন save করতে পারবেন না। CEO বা chairman এর জন্য আলাদা viewer account দিন। অ্যাডমিনের পাসওয়ার্ড শেয়ার করবেন না।

Run account tools in the package root with the same data configuration as the service. Passwords are entered in hidden prompts, never as command arguments. The last active administrator cannot be disabled until another one exists.

বাংলা: service এর একই data config ব্যবহার করে package root থেকে account tool চালান। পাসওয়ার্ড কমান্ডের argument হিসেবে লিখবেন না। লুকানো prompt এ দিন। আরেকজন অ্যাডমিন না থাকলে শেষ active admin disable করা যাবে না।

```sh
node backend/setup.mjs --add-user
node backend/manage-user.mjs
node backend/manage-user.mjs --reset-password
node backend/manage-user.mjs --disable
```

Resetting a password or disabling an account revokes that account's sessions. Sign-out also invalidates its current session. Login attempts are limited after repeated failures. HTTPS cookies are HttpOnly and SameSite Strict; mutation requests also require an allowed origin and CSRF token.

বাংলা: পাসওয়ার্ড reset বা account disable করলে ওই account এর session বাতিল হবে। Sign out করলে বর্তমান session বন্ধ হবে। বারবার ভুল login হলে সাময়িক limit হবে। HTTPS cookie ও CSRF যাচাই অ্যাপের ভেতরেই আছে।

## 9 Move existing data and upgrade an earlier server

For an offline HTML dashboard, open your current populated copy and choose Data backup. In the new server dashboard sign in as admin, open Data and daily uploads, select Restore backup, review the row/date/target counts, then choose Restore shared history. This is a full replacement of shared sales, import metadata and targets, not an additive merge. Accounts remain unchanged. A recovery copy of the sales database is saved before restoration.

বাংলা: পুরনো HTML এ সব তথ্য থাকলে আগে সেখান থেকে Data backup নিন। নতুন server dashboard এ admin হিসেবে লগইন করে Data and daily uploads থেকে Restore backup দিন। রেকর্ড, তারিখ ও target সংখ্যা দেখে Restore shared history চাপুন। এতে shared sales, import metadata ও target সম্পূর্ণ প্রতিস্থাপিত হবে; যোগ করে merge হবে না। ইউজার account থাকবে। আগে server recovery copy তৈরি করবে।

If you have not saved historical CSVs into the old dashboard, upload all gross and delivered CSVs directly instead. No initial source data is bundled. Checking a preview alone never marks a report as imported.

বাংলা: পুরনো dashboard এ history save করা না থাকলে সব gross ও delivered CSV একসঙ্গে বেছে upload করুন। এই প্যাকেজে আগে থেকে sales নেই। শুধু preview দেখলে কোনো report imported হয়ে যায় না।

When upgrading the earlier server ZIP, stop the service, back up `sales.sqlite` and `auth.sqlite`, preserve `backend/config.json` and the private data directory, replace only application code/public assets, and restart. Existing report, partition and account tables are retained; the new planning and audit tables are created automatically. The old dated sample CSVs are no longer included. Set `seedIncludedReports` to false before starting this version.

বাংলা: আগের server package আপগ্রেড করতে service বন্ধ করুন এবং দুই SQLite database এর backup নিন। `config.json` ও private data directory অক্ষত রাখুন। শুধু app code ও public asset বদলে আবার চালু করুন। পুরনো report ও account table থাকবে। নতুন planning ও audit table নিজে তৈরি হবে। এই সংস্করণ চালুর আগে `seedIncludedReports` false করুন।

The old upload API and old frontend are replaced by the current batch API. Hard-refresh browsers after deployment. Do not combine an old cached frontend with the new backend. Keep the whole old release and a database backup for rollback. Roll back code and its compatible database backup together if required.

বাংলা: পুরনো upload API এর বদলে batch API এসেছে। deploy এর পরে browser hard refresh করুন। পুরনো cached frontend ও নতুন backend একসঙ্গে ব্যবহার করবেন না। rollback এর জন্য আগের release ও database backup রাখুন। দরকার হলে code এবং উপযুক্ত database backup একসঙ্গে ফিরিয়ে দিন।

## 10 Daily sales uploads and file decisions

Choose both report types in one selection, including historical backfills. `SalesReport_` files use Order Date for GMV and GOS. `SalesReportDelivered` files use DeliveredDate for NMV and NOS. File names help choose the stream; the reporting date comes from each row's event date. Gross and delivered files for one date are separate partitions.

বাংলা: gross ও delivered দুই ধরনের report একসঙ্গে বেছে নিতে পারবেন। পুরনো দিনের ফাইলও দেওয়া যাবে। `SalesReport_` এর Order Date থেকে GMV/GOS এবং `SalesReportDelivered` এর DeliveredDate থেকে NMV/NOS হয়। নাম দেখে stream বোঝা হয়; আসল reporting date নেওয়া হয় row এর event date থেকে। একই দিনের gross ও delivered আলাদা।

After scanning, open File-by-file decisions. Override selects that file's full date records, including a duplicate already saved. Skip removes the file from this batch and preserves saved records. The preview shows the selected totals and dates. Click Import selected reports to make the central database change. If every file is already saved or skipped, the button remains disabled until you choose an Override or a new report.

বাংলা: scan শেষে File-by-file decisions দেখুন। Override দিলে ওই ফাইলের সম্পূর্ণ date record বেছে নেওয়া হবে, আগে save করা duplicate হলেও। Skip দিলে ওই ফাইল এই batch থেকে বাদ যাবে; saved record থাকবে। preview তে total ও date দেখুন। কেন্দ্রীয় ডেটাবেসে save হবে শুধু Import selected reports চাপলে। সব ফাইল আগে saved বা skipped থাকলে নতুন report বা Override না বেছে নেওয়া পর্যন্ত button বন্ধ থাকবে।

Identical copies are skipped by default. Current saved rows are checked, so an old import hash alone does not hide missing or changed records. Different versions for the same stream and date require a selection or exclusion. Use latest dated exports only when filenames contain an unambiguous CreatedOn timestamp. A newer filename does not prove completeness.

বাংলা: একই তথ্যের copy ডিফল্টভাবে skip হয়। বর্তমান saved row যাচাই করা হয়, শুধু পুরনো import hash দেখে missing বা changed data লুকিয়ে রাখা হয় না। একই stream ও date এর ভিন্ন report থাকলে একটি বেছে নিন বা বাদ দিন। CreatedOn সময় স্পষ্ট থাকলে latest dated exports ব্যবহার করতে পারেন। নতুন নামের ফাইল মানেই সম্পূর্ণ report নয়।

Override replaces the whole selected stream/date partition. It does not append to that date or merge incomplete reports. If a file contains several dates and another file overrides one of them, the first file is marked partly selected. The most recent explicit Override wins an overlapping date. Review the totals before saving. Repeated legitimate item lines inside the chosen report stay intact.

বাংলা: Override পুরো stream/date partition বদলে দেয়। একই দিনের ওপর নতুন করে যোগ করে না এবং অসম্পূর্ণ report merge করে না। একটি ফাইলে একাধিক date থাকলে অন্য ফাইল কোনো date override করতে পারে; তখন প্রথমটি partly selected দেখাবে। সর্বশেষ explicit Override ওই overlapping date পাবে। save করার আগে total দেখুন। আসল report এর বৈধ repeated item line রাখা হয়।

Each commit increments the shared revision. Open dashboards check every 15 seconds while visible. A preview pauses automatic replacement of the local view. If another admin saves meanwhile, your stale commit returns REVISION_CONFLICT; refresh and stage again. A server restart discards uncommitted previews but preserves committed history.

বাংলা: save হলেই shared revision বাড়ে। খোলা dashboard সাধারণত ১৫ সেকেন্ড পরপর update দেখে। preview চললে local view নিজে বদলে যায় না। এ সময় অন্য admin save করলে আপনার পুরনো preview দিয়ে commit করা যাবে না। Refresh করে আবার upload দিন। server restart এ uncommitted preview বাদ যাবে, committed history থাকবে।

## 11 Target uploads and achievement

The Daily uploads section contains daily and monthly target options for KAM, Seller, Category and Vertical. Download the matching CSV template. Export matching names from the card to get exact names from your currently loaded history. Fill in Excel and save as CSV UTF-8.

বাংলা: Daily uploads এ KAM, Seller, Category ও Vertical এর দৈনিক এবং মাসিক target upload আছে। সঠিক CSV template নামিয়ে নিন। Export matching names দিয়ে বর্তমান sales history এর exact name পাবেন। Excel এ পূরণ করে CSV UTF-8 হিসেবে save করুন।

KAM matches Sales Person. Seller matches Vendor. Category requires the source category name plus CategoryLevel 1 to 5. Vertical currently matches Business Unit. Date format is YYYY-MM-DD; Month format is YYYY-MM. At least one of GMVTarget, GOSTarget, NMVTarget or NOSTarget is required. Amounts are BDT; order targets are whole suborder counts. Blank means unknown; zero is an explicit zero plan.

বাংলা: KAM এর সঙ্গে Sales Person এবং Seller এর সঙ্গে Vendor মেলে। Category এর জন্য source category name ও CategoryLevel ১ থেকে ৫ দিতে হবে। বর্তমানে Vertical মানে Business Unit। Date হবে YYYY-MM-DD এবং Month হবে YYYY-MM। চারটি metric এর অন্তত একটি target দিতে হবে। টাকার target BDT এবং order target পূর্ণ suborder সংখ্যা। খালি ঘর মানে target জানা নেই; শূন্য মানে স্পষ্ট zero target।

Identical target rows are skipped. A corrected key replaces all four target cells on that row; blank cells clear previous values. Other keys stay unchanged. Conflicting selected rows must be corrected before saving. Daily and monthly plans are independent and never added together.

বাংলা: একই target row skip হবে। একই key এর corrected row এ চারটি target cell প্রতিস্থাপিত হবে। খালি cell দিলে আগের target উঠে যাবে। অন্য key অপরিবর্তিত থাকবে। একই key এ ভিন্ন selected value থাকলে সংশোধন করে upload করতে হবে। দৈনিক ও মাসিক plan আলাদা; একসঙ্গে যোগ হয় না।

Open Targets and achievement, choose level, daily/monthly plan, metric and dates. Daily plans require all selected daily targets. Monthly actuals start on the first day of the selected start month and run through the selected end date; monthly targets remain full-month plans without automatic proration. Global sales dimension filters do not apply to this independent scorecard.

বাংলা: Targets and achievement এ level, daily/monthly, metric ও date দিন। দৈনিক plan এ নির্বাচিত সব দিনের target লাগবে। মাসিক actual শুরু হবে শুরুর মাসের প্রথম দিন থেকে এবং নির্বাচিত শেষ date পর্যন্ত চলবে। মাসিক target পুরো মাসের; নিজে ভাগ করে prorate করা হয় না। সাধারণ sales filter এই আলাদা scorecard এ প্রযোজ্য নয়।

Achievement is actual divided by target and is available only with complete required sales dates and target periods and a positive target. Missing reports are unknown, not zero. Below 80 percent is dark red; 80 through 90 percent inclusive is yellow; above 90 but below 100 is blue; 100 or more is dark green. Growth is shown with plus in dark green; decline with minus in dark red.

বাংলা: Achievement হলো actual ভাগ target। দরকারি sales date ও target period সম্পূর্ণ এবং target শূন্যের বেশি হলে শতাংশ দেখাবে। missing report কে zero ধরা হয় না। ৮০ শতাংশের নিচে dark red, ৮০ থেকে ৯০ inclusive yellow, ৯০ এর বেশি কিন্তু ১০০ এর নিচে blue এবং ১০০ বা বেশি dark green। Growth এ সবুজ plus ও decline এ লাল minus থাকবে।

## 12 Exports and sharing

Export view downloads the active report. Each scorecard supports search, sorting, copying and CSV export. Export full HTML creates an independent snapshot with the latest loaded shared sales, historical dates, targets and the modern dashboard. The recipient can open it offline. It does not remain connected to the server and will not receive tomorrow's changes.

বাংলা: Export view বর্তমান report নামায়। table এ search, sort, copy ও CSV export আছে। Export full HTML এ shared sales, পুরনো date, target ও dashboard সহ আলাদা snapshot তৈরি হয়। প্রাপক offline খুলতে পারবেন। এটি server এর সঙ্গে connected থাকে না এবং পরের দিনের update নিজে পাবে না।

The online system uses central persistence. The exported HTML edition uses its own local browser history when edited. To share a continuously updated view, give your boss a viewer account and the HTTPS server address. To share a dated file, export a fresh full HTML after the daily save.

বাংলা: online সিস্টেমের data কেন্দ্রীয়ভাবে থাকে। exported HTML পরে edit করলে তার নিজস্ব browser history ব্যবহার করবে। বসকে সব সময় updated view দিতে viewer account ও HTTPS address দিন। দিনের snapshot ফাইল দিতে daily save এর পর নতুন full HTML export করুন।

## 13 Backups and recovery

With autoBackupHours 24, the running backend creates local sales and auth database snapshots at startup and approximately every 24 hours. It prunes scheduled snapshots older than backupRetentionDays. This schedule runs only while the service is running. Pre-restore sales recovery copies are retained separately and should be reviewed by IT. Copy backups to another machine or managed backup location; local snapshots alone do not protect against disk loss.

বাংলা: autoBackupHours ২৪ থাকলে backend চালুর সময় ও প্রায় ২৪ ঘণ্টা পরপর sales এবং auth database snapshot নেয়। retention অনুযায়ী পুরনো scheduled snapshot সরায়। service চালু থাকলেই schedule কাজ করবে। restore এর আগের recovery copy আলাদাভাবে থাকে; IT এগুলো দেখবেন। ব্যাকআপ অন্য ডিভাইসেও কপি করুন। একই ডিস্কের backup ডিস্ক নষ্ট হওয়া থেকে রক্ষা করবে না।

Manual database snapshots while the service runs:

বাংলা: service চলার সময় manual database snapshot নিতে পারেন।

```sh
node backend/backup.mjs
```

A destination may be supplied without changing the live database location:

বাংলা: live database এর path না বদলে আলাদা backup destination দিতে পারেন।

```sh
node backend/backup.mjs /your/private/backup/folder
```

On Windows, use a local or managed backup path appropriate for your environment. The script produces consistent SQLite copies with VACUUM INTO; sales and auth are separate snapshots, not one cross-database atomic transaction. Keep the pair together for disaster recovery. JSON data backup contains sales and targets but not user accounts, passwords or deployment config.

বাংলা: Windows এ উপযুক্ত local বা managed backup path দিন। script VACUUM INTO দিয়ে SQLite copy নেয়। sales ও auth আলাদা snapshot, একসঙ্গে একটি atomic transaction নয়। disaster recovery এর জন্য দুই ফাইল একসঙ্গে রাখুন। JSON data backup এ sales ও target থাকে, user account, password বা server config থাকে না।

For a complete server recovery, stop Node first. Preserve the current sales.sqlite, auth.sqlite and any matching -wal/-shm files together in a private recovery folder before replacing them. Copy selected database snapshots into the dataDir as sales.sqlite and auth.sqlite. Preserve the production config and code release. Ensure no stale WAL/SHM files from the replaced database remain in the live data directory. Start the service and validate totals, accounts and a new import. Never replace SQLite files while Node is running.

বাংলা: পুরো server recover করতে আগে Node বন্ধ করুন। বর্তমান SQLite এবং সংশ্লিষ্ট -wal/-shm ফাইলগুলো একসঙ্গে private recovery folder এ রাখুন। নির্বাচিত backup দুটো dataDir এ sales.sqlite ও auth.sqlite নামে বসান। production config ও code release ঠিক রাখুন। live directory তে আগের database এর stale WAL/SHM যেন না থাকে। তারপর service চালিয়ে total, account এবং নতুন import পরীক্ষা করুন। Node চলার সময় SQLite ফাইল বদলাবেন না।

## 14 Source changes and rebuilds

Edit `frontend-src/dashboard-app.js` for dashboard behavior, `frontend-src/server-bridge.js` for central integration, and `frontend-src/style.css` for appearance. Edit the API in `backend/server.mjs` and persistence in `backend/data-worker.mjs`. The shared import runtime is in `backend/shared` and is refreshed from the frontend worker files during a build.

বাংলা: dashboard behavior এর জন্য dashboard-app.js, server integration এর জন্য server-bridge.js এবং ডিজাইনের জন্য style.css সম্পাদনা করুন। API server.mjs এবং database processing data-worker.mjs এ আছে। build এর সময় shared runtime আপডেট হয়।

```sh
npm run build
npm test
```

The build regenerates hashed assets, app-config.js, index.html and asset-manifest.json. Ship the whole SalesDashboard folder as one release. Do not hand-edit hashed output files. `backend/templates/offline-template.html.gz` is the separately maintained standalone export template; dashboard changes that affect offline behavior must be applied to that template too. This release already includes the current standalone template and per-file controls.

বাংলা: build করলে hashed asset, config, index ও manifest তৈরি হবে। পুরো SalesDashboard এক release হিসেবে দিন। hashed output হাতে edit করবেন না। offline export template আলাদাভাবে রাখা আছে। offline behavior বদলালে ওই template ও আপডেট করতে হবে। এই release এ বর্তমান template ও file control আছে।

## 15 Acceptance checks before handover

Ask an administrator and a viewer to use separate browser sessions. Confirm the following on the actual server before CEO access.

বাংলা: অ্যাডমিন ও viewer কে আলাদা browser session এ পরীক্ষা করতে বলুন। CEO কে দেওয়ার আগে আসল server এ নিচের বিষয়গুলো মিলিয়ে নিন।

| Check | Expected result |
| --- | --- |
| HTTPS and health | Valid certificate and ok true |
| Initial data | Empty on a new private data directory |
| Shared import | Both viewers receive the same GMV GOS NMV NOS |
| Duplicate retry | Already saved reports can still be overridden |
| Skip and override | One replacement keeps one set of date rows |
| Preview discard | No records or import signatures are saved |
| Two admins | Stale revision is rejected and can be retried |
| All target levels | Eight template and upload choices work |
| Missing dates | Achievement is unavailable rather than fabricated |
| Restart | Committed sales targets and accounts remain |
| Export HTML | Opens offline with all included history and targets |
| Recovery | Private backup can be restored and totals reconcile |
| Viewer permissions | Upload and commit are denied |

The automated tests use synthetic reports. They do not establish that your full historical dumps reconcile. Compare a known complete day's source totals with the dashboard, then verify a complete month after all source days are loaded. GOS and NOS count distinct SubOrderId values; they are not assumed to be customer checkout-order counts.

বাংলা: automated test এ পরীক্ষামূলক report ব্যবহার করা হয়েছে। এতে আপনার সব historical dump এর total মিলেছে এমন দাবি করা হচ্ছে না। আগে একটি সম্পূর্ণ দিনের source total মিলিয়ে নিন। সব দিনের ফাইল দেওয়ার পরে একটি সম্পূর্ণ মাস মিলিয়ে দেখুন। GOS ও NOS হলো distinct SubOrderId; এগুলোকে customer checkout order ধরে নেওয়া হয় না।

## 16 Troubleshooting

Origin rejected or login fails after moving to HTTPS. Check the exact browser origin against publicOrigin, the scheme and port, trusted proxy and secure-cookie settings. Use the final hostname instead of alternating localhost, IP and DNS names.

বাংলা: HTTPS এ নেওয়ার পরে Origin rejected বা login সমস্যা হলে browser origin, publicOrigin, scheme, port এবং cookie setting মিলিয়ে নিন। একবার localhost, আরেকবার IP এবং আরেকবার DNS name ব্যবহার করবেন না।

Import button is dimmed. Check unresolved overlaps and ready stream dates. If all files already match saved rows, select Override for the files you want to reimport. If every file was skipped, there is nothing to commit.

বাংলা: Import button dimmed হলে overlap ও ready date দেখুন। আগে saved হলে reimport করতে Override দিন। সব file Skip হলে save করার কিছু নেই।

REVISION_CONFLICT or PREVIEW_EXPIRED. Another commit changed the database, the preview was idle too long, the service restarted, or a new preview replaced it. Refresh and select the original files again. Previewing did not change saved history.

বাংলা: অন্য কেউ save করলে, preview দীর্ঘ সময় খোলা থাকলে, service restart হলে বা নতুন preview শুরু হলে এ ধরনের error হতে পারে। Refresh করে আগের ফাইল আবার বেছে নিন। শুধু preview এর কারণে saved history বদলায়নি।

413 payload too large. Compare the CSV or JSON backup size with app limits and the IIS/Nginx request limit. Raising a proxy limit alone does not raise the application's file limit. Keep adequate memory for large JSON restores.

বাংলা: file size, app limit এবং proxy request limit মিলিয়ে দেখুন। শুধু proxy limit বাড়ালে app limit বাড়ে না। বড় JSON restore এর জন্য যথেষ্ট RAM রাখুন।

SQLite cannot open or writes fail. Check dataDir, its parent directory, the service account's ownership and free disk space. Check that the database is not inside SalesDashboard and not on a network share.

বাংলা: dataDir, parent folder, service user permission এবং disk space দেখুন। database যেন SalesDashboard এর ভেতরে বা network share এ না থাকে।

Browser shows older design. Hard-refresh the page and verify that index.html and app-config.js are not held by a proxy cache. Deploy the hashed assets, manifest and index together. A stale preview should be discarded and rescanned after an upgrade.

বাংলা: browser hard refresh করুন। index ও app-config যেন proxy cache এ পুরনো না থাকে। সব asset একসঙ্গে deploy করুন। upgrade এর পরে পুরনো preview বাদ দিয়ে নতুন scan করুন।

Target names do not match or achievement is blank. Use Export matching names, confirm Business Unit for Vertical, and check the selected CategoryLevel. Missing target periods, missing gross/delivered files and zero targets deliberately suppress achievement.

বাংলা: matching names export করে name মেলান। Vertical এর Business Unit এবং CategoryLevel ঠিক আছে কি না দেখুন। missing target period, missing sales file বা zero target হলে achievement ইচ্ছাকৃতভাবে দেখানো হয় না।

## 17 Official technical references

These references support the hosting and runtime choices. The commands and folder paths above are specific to this package.

বাংলা: নিচের অফিসিয়াল reference গুলো runtime ও hosting বিষয়ে সহায়ক। উপরের command ও folder path এই প্যাকেজ অনুযায়ী তৈরি।

If Bangla does not display correctly in Word, install the supplied docs/fonts/NotoSansBengali-Regular.ttf and reopen the document. DM Sans fonts are in SalesDashboard/static/fonts.

বাংলা: Word এ বাংলা ঠিক না দেখালে দেওয়া Noto Sans Bengali font ইনস্টল করে ডকুমেন্ট আবার খুলুন। DM Sans font public fonts folder এ আছে।

Node.js downloads: https://nodejs.org/en/download

Node.js 24 SQLite API: https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html

Microsoft IIS reverse proxy: https://learn.microsoft.com/en-us/iis/extensions/url-rewrite-module/reverse-proxy-with-url-rewrite-v2-and-application-request-routing

Nginx reverse proxy: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

Apple launchd guidance: https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html

systemd service reference: https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html

## 18 Optimized bulk uploads and user creation

Version 2.1 processes uploads as account-owned background jobs. Selecting 60–70 files still sends one CSV at a time, with progress in the existing preview. Only matching saved stream/date partitions are loaded for duplicate verification, and only selected partitions are replaced during commit. CSV parsing stores only the reporting fields, using dictionary codes and typed numeric arrays. Repeated identical rows inside one report remain intact.

বাংলা: ২.১ সংস্করণে ৬০–৭০টি ফাইল একসঙ্গে বাছাই করলেও একবারে একটি CSV background job এ পাঠানো হয়। duplicate যাচাইয়ে শুধু সংশ্লিষ্ট date এর saved data পড়া হয়। save এ শুধু নির্বাচিত stream/date বদলায়। report এর জন্য প্রয়োজনীয় column compact আকারে রাখা হয়; একই report এর repeated item line বাদ দেওয়া হয় না।

The server builds the shared compressed download using temporary column files, one partition at a time. It reuses the compressed result until the shared revision changes. The browser transfers the compressed bytes directly to its worker, avoiding a base64 copy during initial load. All report views, filters, targets, Override/Skip and offline exports are retained.

বাংলা: shared download তৈরিতে সম্পূর্ণ history একসঙ্গে RAM এ merge করা হয় না। অস্থায়ী column file ব্যবহার হয় এবং revision না বদলালে তৈরি download পুনরায় ব্যবহার হয়। browser compressed bytes সরাসরি worker এ পাঠায়। আগের সব report, filter, target, Override/Skip ও HTML export থাকে।

Sign in as administrator → Daily Upload → scroll to the bottom → User access management. Enter a unique username and an initial password of 12–256 characters. The default role is Viewer. Choose Administrator only for people who should upload/restore data and create users. Click Create user. Use the account list search, A–Z/Z–A sort, Copy or Export CSV. Password hashes never appear in the list. Account disabling/reset remains available through backend/manage-user.mjs.

বাংলা: Admin login → Daily Upload → একদম নিচে User access management। আলাদা username এবং ১২–২৫৬ অক্ষরের password দিন। default role Viewer। যাঁরা upload/restore ও user তৈরি করবেন কেবল তাঁদের Administrator দিন। Create user চাপুন। তালিকায় search, sort, Copy ও Export CSV আছে। password তালিকায় দেখানো হয় না। reset/disable এর CLI আগের মতো আছে।

Viewer accounts can view/copy/export report tables, export a full HTML/JSON backup, and download original committed sales CSVs from Uploaded source files. The archive includes prior replaced versions, so its row totals are not the current dashboard totals. Originals are not recoverable from a JSON-only migration; those entries show Unavailable. Viewers cannot upload sales, targets or backups, restore history, create users or read the account list; the backend enforces these rules.

বাংলা: Viewer report দেখতে, copy/export করতে, পূর্ণ HTML/JSON নামাতে এবং Uploaded source files থেকে original committed CSV নামাতে পারবেন। archive এ পুরনো replaced version থাকতে পারে; তাই archive এর line যোগ করে current sales ধরবেন না। শুধু JSON থেকে restore করা history তে original CSV না থাকলে Unavailable দেখায়। Viewer upload/restore/user তৈরি বা account list দেখতে পারবেন না। backend থেকেও নিষেধ কার্যকর।

The default per-file limit remains 20 MB. The new maxPreviewMB setting defaults to 512 MB of compact incoming column data per sales preview; exceeding it marks the next file invalid with an explanation, without changing saved history. Save the ready files, then upload the remaining files, or have your team increase the budget after checking RAM. This is a compact-column budget, not a hard process-RAM limit. High-cardinality text, temporary parsing, multiple admins and browser history also use memory. No fixed speed is guaranteed for arbitrarily large files; test with real annual data on the actual server/browser.

বাংলা: প্রতি CSV default limit ২০ MB। maxPreviewMB default ৫১২ MB compact incoming data; সীমা পার হলে পরের file কারণসহ invalid দেখাবে, saved history বদলাবে না। ready file save করে বাকি file দিন, অথবা RAM দেখে team limit বাড়াবে। এটি process RAM এর hard limit নয়। অনেক unique text, parsing, একাধিক admin ও browser history তেও RAM লাগে। সীমাহীন file size এ একই speed নিশ্চিত করা যায় না; আসল server ও browser এ বছরের বাস্তব data দিয়ে test করুন।

## 19 Upgrade and 502 diagnosis

Before upgrading, take both sales/auth SQLite backups and preserve your existing backend/config.json. Stop the Node service, replace SalesDashboard, backend code, frontend-src and scripts as one release, restore the production config if necessary, keep the same dataDir, then restart the one Node service. Never replace the data folder with an empty folder. The existing SQLite schema and accounts remain compatible; there is no destructive migration. Hard-refresh the browser so the new app-config and hashed assets load together.

বাংলা: upgrade এর আগে sales ও auth database backup এবং backend/config.json রাখুন। Node service বন্ধ করে নতুন frontend/backend/source/scripts একসঙ্গে বসান। আগের production config ও dataDir বহাল রাখুন। live data folder খালি folder দিয়ে বদলাবেন না। একই Node service আবার চালান এবং browser hard refresh করুন। database/account আগেরটাই থাকবে; destructive migration নেই।

Run the following from the package root on macOS, Linux or Windows:

```sh
node scripts/diagnose.mjs
```

A screenshot saying Server request failed (502) does not prove that a CSV is invalid. It means the reverse proxy did not obtain a valid backend response. If the direct health check fails, inspect/restart the Node service and check its logs, configured port, disk permissions and available memory. If direct health succeeds but the public website fails, inspect IIS ARR/URL Rewrite or Nginx routing and logs. In IIS record the status/substatus and Win32 error. Keep the Node service alive through systemd, launchd or your Windows service manager.

বাংলা: 502 দেখলেই CSV ভুল ধরে নেবেন না। proxy backend থেকে সঠিক response পায়নি। direct health ব্যর্থ হলে Node service, log, port, data folder permission ও memory দেখুন। direct health ঠিক কিন্তু website 502 হলে IIS/Nginx route ও log পরীক্ষা করুন। IIS এর status/substatus ও Win32 error নিন। systemd/launchd/Windows service manager দিয়ে Node স্থায়ীভাবে চালান।

The new browser polls short job requests instead of keeping the import/commit request open for its entire processing time. File and commit submissions have idempotency IDs, so retrying the same request during a temporary proxy interruption does not apply it twice. A restart discards unfinished preview/jobs; committed history survives. After an ambiguous network failure, refresh and check the saved history before starting a new batch. A 409 means another administrator saved a newer revision; upload again from the refreshed history.

বাংলা: পুরো import শেষ হওয়া পর্যন্ত একটি request খোলা থাকে না; browser ছোট request এ job status দেখে। একই request retry হলে idempotency ID দিয়ে দ্বিগুণ save আটকানো হয়। restart এ অসম্পূর্ণ preview/job বাদ যাবে, committed history থাকবে। network failure হলে নতুন batch শুরুর আগে refresh করে saved history দেখুন। 409 হলে অন্য admin নতুন data save করেছেন; refresh করে আবার upload দিন।

The package removes duplicate private engine copies, the unused generated frontend source bundle, the unused seed folder and an obsolete font license copy. Runtime database, backup, source history and user-selected files are not deleted by this cleanup. Interrupted temporary snapshot-column files are cleaned on startup; expired previews are removed automatically. Original source archive files remain available for authorized downloads.

বাংলা: duplicate private engine copy, unused generated source bundle, seed folder ও পুরনো অতিরিক্ত font license বাদ দেওয়া হয়েছে। live database, backup, uploaded source history বা আপনার নির্বাচিত file delete করা হয় না। অসম্পূর্ণ temporary column file startup এ এবং expired preview নিয়মিত পরিষ্কার হয়। অনুমোদিত original source download থাকে।
