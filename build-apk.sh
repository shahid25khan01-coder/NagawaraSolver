#!/usr/bin/env bash
# NagawaraSolver - Ward-22 Civic Resolution Portal
# Android APK Generation Script
set -e

echo "=========================================="
echo "NagawaraSolver Android APK Build Tool"
echo "Ward-22 Nagawara - Syed Ali President"
echo "=========================================="

echo "Step 1: Building production web assets..."
npm run build

echo "Step 2: Checking APK build tools..."

if command -v bubblewrap &> /dev/null; then
    echo "Using Google Bubblewrap (TWA) to build APK..."
    bubblewrap build
    echo "✓ APK generated in current directory!"
elif command -v npx &> /dev/null; then
    echo "Option A: Building via Google Bubblewrap..."
    echo "Run: npx @bubblewrap/cli build"
    echo ""
    echo "Option B: Building via Capacitor Android Studio..."
    echo "Run:"
    echo "  npm install @capacitor/core @capacitor/android"
    echo "  npx cap add android"
    echo "  npx cap copy android"
    echo "  npx cap open android"
    echo ""
    echo "Option C: Cloud 1-Click APK Generator (Recommended - No SDK needed):"
    echo "  Visit: https://www.pwabuilder.com/reportcard?url=https://ais-pre-loflshmm2nxz25v554pvvm-921852625945.asia-east1.run.app"
    echo "  Click 'Package for Stores' -> 'Android' -> 'Download Package' to get signed APK!"
else
    echo "Please install Node.js and Android SDK, or use PWABuilder (pwabuilder.com)"
fi
