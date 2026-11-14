# Linux server installation

Read sections 1–4 of [the full English and Bangla guide](INSTALLATION_EN_BN.md) first for prerequisites, accounts and configuration. Then follow this platform procedure.


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

Continue with sections 8–17 of the full guide for migration, uploads, targets, backups and recovery.
