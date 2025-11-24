# AI Popup Infopedia - Android App Walkthrough

I have created a React Native (Expo) application that mirrors the functionality of your Chrome extension.

## Project Structure

-   **App.js**: Main entry point, sets up Navigation and Dark Theme.
-   **src/screens/**:
    -   `HomeScreen.js`: The main interface. Enter text -> Get Definition -> Save.
    -   `HistoryScreen.js`: View saved definitions by List. Edit/Delete items.
    -   `SettingsScreen.js`: Configure AI Models, Global Prompt, and Word Lists.
-   **src/utils/**:
    -   `storage.js`: Handles saving data to the device (AsyncStorage).
    -   `api.js`: Handles communicating with OpenAI-compatible APIs (Ollama, Gemini, etc.).

## How to Run

1.  **Install Dependencies**:
    Open a terminal in `c:\Hotmail\OneDrive\Extensions\Isolates\AI Popup Info Mob` and run:
    ```bash
    npm install
    ```

2.  **Start the App**:
    ```bash
    npx expo start
    ```

3.  **Test on Device**:
    -   Install **Expo Go** on your Android phone from the Play Store.
    -   Scan the QR code shown in the terminal.

4.  **Test on Android Studio Emulator**:
    -   Open Android Studio and launch a Virtual Device (AVD) from the Device Manager.
    -   In your terminal (where `npx expo start` is running), press `a`.
    -   Expo will automatically install Expo Go on the emulator and open your app.

## Expo Go vs. Standalone App

You might be wondering: **"Why do I need Expo Go?"**

-   **Expo Go** is a *development tool*. It acts like a container that lets you run and test your app instantly without waiting for a long compilation process. Think of it like a web browser for your React Native code.
-   **Standalone App (APK)**: This is the final file you install directly on your phone (like any other app). To get this, you need to **build** the project.

### How to Build a Standalone APK

To create a real `.apk` file that you can install without Expo Go, you have two main options:

#### Option 1: EAS Build (Cloud Build - Easiest)
1.  Install the EAS CLI: `npm install -g eas-cli`
2.  Log in to your Expo account: `eas login`
3.  Configure the build: `eas build:configure`
4.  Run the build for Android: `eas build -p android --profile preview`
    *   This will generate an APK link after a few minutes.

#### Option 2: Local Build (Requires Android Studio)
1.  Ensure you have Android Studio and the Android SDK installed.
2.  Run: `npx expo run:android`
    *   This will build the app locally and install it on your connected device or emulator.


## Features Implemented

-   **AI Integration**: Supports any OpenAI-compatible endpoint (just like the extension).
-   **History Management**: Save definitions to specific lists, view history, edit, and delete.
-   **Settings**: Full management of Models and Lists.
-   **Dark Mode**: The app uses a dark theme by default to match the extension's aesthetic.

## Getting Started Guide

Since this is a fresh install, you need to set it up:

1.  **Configure AI Model**:
    *   Go to the **Settings** tab.
    *   Tap the **+** button next to "AI Models".
    *   Enter your model details (e.g., Name: "Gemini", Endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, Model Name: `gemini-2.0-flash`, API Key: `YOUR_KEY`).
    *   Tap **Save**.
    *   Select the radio button next to your new model to make it default.

2.  **Create a List**:
    *   In **Settings**, tap the **+** button next to "Word Lists".
    *   Enter a name (e.g., "My Vocabulary") and save.

3.  **Get a Definition**:
    *   Go to the **Home** tab.
    *   Type a word (e.g., "Serendipity").
    *   Tap **Get Definition**.
    *   Once loaded, you can tap **Save** to add it to your list.

## Note on "Popup" Functionality
On Android, creating a "popup" that appears over other apps when text is selected requires building a native Android Service (using `PROCESS_TEXT` intent). This Expo app implements the *core logic* and *UI*. To get the system-wide text selection feature, you would need to eject from Expo and write native Android code (Kotlin/Java) to handle the intent and launch a floating activity.
