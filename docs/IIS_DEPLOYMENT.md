# Windows Server and IIS installation

Read sections 1–4 of [the full English and Bangla guide](INSTALLATION_EN_BN.md) first for prerequisites, accounts and configuration. Then follow this platform procedure.


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

Continue with sections 8–17 of the full guide for migration, uploads, targets, backups and recovery.
