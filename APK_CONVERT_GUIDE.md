# NagawaraSolver - Android APK Conversion Guide
**Ward-22 Nagawara Civic Issue Redressal Portal**
*Under the Leadership of Syed Ali, President Ward-22 Nagawara*

---

## 🚀 Quick Summary
This Progressive Web App (PWA) is engineered with complete Android WebAPK and Trusted Web Activity (TWA) compliance:
- Valid Web Manifest at `/manifest.json`
- Maskable & high-resolution icons (192x192, 512x512)
- Digital Asset Links at `/.well-known/assetlinks.json`
- Service Worker offline caching via Workbox
- Geolocation and camera permissions enabled

There are **4 primary methods** to get or build the Android APK:

---

## Method 1: Instant 1-Click Cloud APK Generator (PWABuilder)
*Recommended — No Android Studio or Java SDK required. Produces ready-to-install `.apk` and Google Play `.aab` in 30 seconds.*

1. Go to **[PWABuilder Report Card](https://www.pwabuilder.com/reportcard?url=https://ais-pre-loflshmm2nxz25v554pvvm-921852625945.asia-east1.run.app)**.
2. Click **"Package for Stores"**.
3. Select **Android** and click **"Generate Package"**.
4. Download the generated ZIP file containing:
   - `app-release-signed.apk` (can be directly sideloaded onto any Android phone)
   - `app-release.aab` (ready to upload to Google Play Console)
5. Transfer `app-release-signed.apk` to your Android device via WhatsApp, Google Drive, or USB cable, and tap to install.

---

## Method 2: Direct Native Android Install (WebAPK)
*Instant 1-tap installation directly on any Android smartphone.*

1. Open the application URL in **Google Chrome** or **Samsung Internet** on your Android smartphone.
2. Tap the **three-dot menu (⋮)** in the top right corner.
3. Tap **"Install App"** (or **"Add to Home screen"**).
4. Android's native OS package service will automatically compile a signed native **WebAPK**.
5. The **NagawaraSolver** app icon will appear directly in your Android phone's App Drawer and Home Screen with standalone full-screen window, custom splash screen, and offline support.

---

## Method 3: Google Bubblewrap CLI (TWA)
*Google's official command-line tool for generating an Android Studio / Gradle project and compiling APKs.*

The repository includes the pre-configured `twa-manifest.json`.

```bash
# 1. Install Google Bubblewrap globally
npm install -g @bubblewrap/cli

# 2. Build the signed Android APK & AAB
bubblewrap build

# The output APK will be saved as app-release-signed.apk
```

---

## Method 4: Capacitor CLI + Android Studio
*Best for native Android developers wanting full access to Android Java/Kotlin source code and Gradle.*

The repository includes `capacitor.config.json`.

```bash
# 1. Build the production web assets
npm run build

# 2. Install Capacitor native Android dependencies
npm install @capacitor/core @capacitor/android

# 3. Add the Android platform
npx cap add android

# 4. Copy the built web assets
npx cap copy android

# 5. Open the project in Android Studio
npx cap open android
```

In Android Studio:
1. Click **Build** &rarr; **Build Bundle(s) / APK(s)** &rarr; **Build APK(s)**.
2. The compiled APK will be located in:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Sideloading Instructions for Android Phones
When installing any downloaded `.apk` directly on Android:
1. Open the downloaded `.apk` file from your Downloads or File Manager.
2. If Android prompts **"For your security, your phone is not allowed to install unknown apps from this source"**, tap **Settings**.
3. Toggle **"Allow from this source"** to ON.
4. Tap **Install** and then **Open**.
