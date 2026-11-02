# AI Popup Infopedia (Mobile)

This is the mobile version of the AI Popup Infopedia extension, built with React Native and Expo.

## Prerequisites

- Node.js and npm.
- Android Studio with Android SDK Platform 34 and Build Tools 34.0.0 (as configured in `android/build.gradle`).
- A Java toolchain compatible with the project's Gradle wrapper.
- An Android emulator or a connected Android device with USB debugging enabled.

## Setup

Clone the repository and install the locked dependencies:

```bash
git clone https://github.com/13pathak/AI-Popup-Android-.git
cd AI-Popup-Android-
npm ci
```

The install step applies the checked-in `expo-share-intent` patch through `patch-package`.

## Running the App

Build and install the native Android app:

```bash
npm run android
```

For a physical device, use `npm run android -- --device`. After the first build, restart the JavaScript development server with `npx expo start --dev-client` when needed.

This project uses `expo-share-intent`, which requires a native build. Expo Go does not include this project's native sharing integration; see the [Expo development-build guide](https://docs.expo.dev/develop/development-builds/introduction/).

## Features

-   **Home**: Enter text to get an AI definition using your configured model. Save definitions to your lists.
-   **History**: View your saved definitions, organized by lists. Edit or delete items.
-   **Settings**: Configure your AI models (Ollama, Gemini, etc.), set a global prompt, and manage your word lists.

## Sharing Text

The Android configuration includes text-sharing and Process Text intent filters. In the native app, received text is placed in the Home input; choose your configured model and request a definition.

The checked-in Android build uses the debug signing configuration. Configure your own release signing before distributing a production APK.
