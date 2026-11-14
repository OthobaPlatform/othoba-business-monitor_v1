# macOS server installation

Read sections 1–4 of [the full English and Bangla guide](INSTALLATION_EN_BN.md) first for prerequisites, accounts and configuration. Then follow this platform procedure.


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

Continue with sections 8–17 of the full guide for migration, uploads, targets, backups and recovery.
