# 🤖 NagawaraSolver - Android Studio Project Guide

This project has been converted into a complete, native **Android Studio** project ready to open, run, debug, and package into APK or AAB binaries.

---

## 📁 Android Project Structure

The native Android project is located in the `/android` directory:

```
android/
├── app/
│   ├── build.gradle                   # App-level Gradle config (applicationId: org.nagawara.ward22.solver)
│   ├── proguard-rules.pro
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml    # Permissions: Camera, GPS Geolocation, Internet, Network State
│       │   ├── java/org/nagawara/ward22/solver/
│       │   │   └── MainActivity.java  # Native Capacitor Bridge Activity
│       │   ├── res/                   # App icons, splash screens, XML configurations
│       │   └── assets/
│       │       └── public/            # Bundled production web application assets (HTML, CSS, JS)
├── build.gradle                       # Root Gradle build script
├── settings.gradle                    # Gradle modules configuration
├── variables.gradle                   # SDK versions (minSdk 24, compileSdk 36, targetSdk 36)
├── gradlew & gradlew.bat              # Gradle wrappers
└── capacitor.settings.gradle
```

---

## 🚀 How to Open in Android Studio

1. **Launch Android Studio** (Hedgehog, Iguana, Jellyfish, Koala, Ladybug, or newer).
2. Click **Open** (or go to `File -> Open...`).
3. Browse to and select the **`android`** folder inside this project directory.
4. Click **OK**.
5. Wait a few moments for Android Studio to index and run **Gradle Sync**.
   - If prompted, click **"Trust Project"** and **"Sync Project with Gradle Files"**.

---

## 📱 How to Run on an Emulator or Physical Phone

1. **Start an Android Emulator** via Device Manager (Pixel 7 / Pixel 8 recommended, API 33+), OR plug in your Android phone with **USB Debugging** enabled.
2. In the top toolbar, select the **`app`** run configuration and your target device.
3. Click the green **Run** button (or press `Shift + F10` / `Ctrl + R`).
4. The app will install and open immediately on the device with full camera and geolocation capabilities.

---

## 📦 How to Build an APK in Android Studio

### Option A: Build Debug APK (For Testing & Sideloading)
1. In Android Studio, go to the top menu:
   - **`Build`** ➔ **`Build Bundle(s) / APK(s)`** ➔ **`Build APK(s)`**
2. Android Studio will compile the app using Gradle.
3. When finished, a notification popup appears: *"APK(s) generated successfully for 1 module"*.
4. Click **"locate"** in the popup, or find your APK at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Copy this `.apk` to any Android device to install!

### Option B: Build Signed Release APK or AAB (For Google Play Store)
1. Go to **`Build`** ➔ **`Generate Signed Bundle / APK...`**
2. Choose **Android App Bundle** (for Google Play Store upload) or **APK** (for direct distribution).
3. Select or create your keystore (`.jks`), set alias and password, then select **Release**.
4. Click **Finish**. Your optimized, signed release binary is generated!

---

## 💻 Building from Terminal / Command Line

If you have Android SDK and JDK installed:

```bash
# 1. Build and sync latest web code to the Android assets directory
npm run android:sync

# 2. Build debug APK using the Gradle wrapper
cd android
./gradlew assembleDebug

# Output APK:
# android/app/build/outputs/apk/debug/app-debug.apk

# 3. Open directly in Android Studio
npm run android:open
```

---

## 🛡️ Configured Android Permissions

The `AndroidManifest.xml` is pre-configured with:
- `android.permission.INTERNET` (Cloud Firestore & AI image analysis sync)
- `android.permission.ACCESS_NETWORK_STATE` (Offline mode detection)
- `android.permission.ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION` (GPS issue mapping in Nagawara Ward 22)
- `android.permission.CAMERA` (Snapping photos of civic issues / road hazards)
- `android.permission.READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE` (Selecting issue photos from gallery)
