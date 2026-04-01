# ModPod Scan 🦶

AI-powered foot scanning app for custom mold creation and modular spacer placement guidance.

Built with **Expo + React Native** · Powered by **Claude Vision AI**

---

## What It Does

1. Open your phone camera (or upload a photo)
2. Point it at your foot from above
3. Claude AI analyzes the image and returns:
   - Foot measurements (length, width, arch height, heel width)
   - Arch type & foot shape classification
   - Pressure zone distribution (heel, ball, arch, toe)
   - Noted conditions (pronation, wide forefoot, etc.)
   - **Modular spacer placement guide** with exact zones & priorities
   - **Custom mold casting notes** for your specific foot geometry
4. Save and share your scan report

---

## Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18 or later)
- [Expo Go](https://expo.dev/go) installed on your Android phone
- An [Anthropic API key](https://console.anthropic.com)

### 2. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/modpod-scan.git
cd modpod-scan
npm install
```

### 3. Add Your API Key

Open `src/constants/index.js` and replace:

```js
export const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';
```

with your actual key from [console.anthropic.com](https://console.anthropic.com).

> ⚠️ **Never commit your API key to GitHub.** Before pushing, move it to a `.env` file (see Security section below).

### 4. Run the App

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your Android phone. The app opens instantly — no build needed.

---

## Project Structure

```
modpod-scan/
├── App.js                      # Root navigation
├── app.json                    # Expo config (permissions, icons, etc.)
├── package.json
├── src/
│   ├── constants/
│   │   └── index.js            # Colors, API key, config
│   ├── services/
│   │   └── claudeApi.js        # Claude Vision API integration
│   ├── components/
│   │   └── UI.js               # Reusable UI components
│   └── screens/
│       ├── HomeScreen.js       # Welcome / landing
│       ├── CaptureScreen.js    # Camera + upload
│       ├── AnalysisScreen.js   # Loading / AI processing
│       ├── ResultsScreen.js    # Full results display
│       └── HistoryScreen.js    # Saved scans
└── assets/                     # Icons and splash screen
```

---

## Security — Protecting Your API Key

Before pushing to GitHub, move your API key out of source code:

### Option A: .env file (quick)
```bash
npm install expo-constants
```

Create `.env` in root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Add `.env` to `.gitignore`:
```
.env
```

Update `src/constants/index.js`:
```js
import Constants from 'expo-constants';
export const ANTHROPIC_API_KEY = Constants.expoConfig.extra.anthropicApiKey;
```

Update `app.json`:
```json
"extra": {
  "anthropicApiKey": "YOUR_KEY_HERE"
}
```

### Option B: Backend proxy (production — recommended)
Build a simple backend (Node/Express or Firebase Function) that holds the API key and proxies requests. Your app calls your backend, not Anthropic directly.

---

## Publishing to Google Play

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure build
```bash
eas build:configure
```

### 3. Build Android APK/AAB
```bash
eas build --platform android
```

### 4. Submit to Play Store
- Create account at [play.google.com/console](https://play.google.com/console) ($25 one-time fee)
- Upload the `.aab` file EAS generates
- Fill in store listing, screenshots, and submit for review

---

## Roadmap

- [ ] Foot outline tracing with on-screen guides
- [ ] Side profile scan (heel-to-toe height)
- [ ] PDF report export
- [ ] Both feet comparison
- [ ] Spacer sizing recommendations
- [ ] Backend proxy for API key security
- [ ] iOS / App Store release

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Expo SDK 51 / React Native |
| AI Vision | Anthropic Claude claude-sonnet-4 |
| Camera | expo-camera |
| Storage | AsyncStorage |
| Navigation | React Navigation v6 |
| Build/Deploy | EAS Build |

---

## License

MIT — ModPod Systems
