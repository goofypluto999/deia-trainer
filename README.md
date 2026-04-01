# Deia's Trainer (Carlos) - Setup Instructions

## Project Overview

This is a complete personal trainer/nutritionist app for Andrea (Deia). It features:

- **Carlos**: Brazilian personal trainer from Rio de Janeiro who speaks Portuguese
- **Voice features**: Text-to-speech using expo-speech (free, built-in)
- **Memory system**: Automatically saves and compacts conversation history
- **Full data tracking**: Exercises, meals, water, weight, progress
- **Daily notifications**: Reminders for meals and exercises
- **Brazilian design**: Sunflower yellow (#FFE550), cream background (#FFF8E7), larger text (20% bigger)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mum's Android Phone                     │
│                                                              │
│   Expo App (React Native) ◄─── HTTP ───►  Your Computer     │
│                                                │             │
│                                          FastAPI Backend    │
│                                                │             │
│                                          SQLite Database    │
└─────────────────────────────────────────────────────────────┘
```

## Cost

- **Backend**: FREE (run locally on your computer)
- **Database**: FREE (SQLite - local file)
- **App**: FREE (Expo - open source)
- **LLM**: Your OpenAI API key (~£3-5/month pay-per-use)
- **Voice**: FREE (Web Speech API - built into phone)

**Total: ~£3-5/month for OpenAI only**

---

## Setup Instructions

### Step 1: Install Python (Backend)

1. Download Python from https://www.python.org/downloads/
2. During installation, CHECK "Add Python to PATH"
3. Open Command Prompt and verify:
   ```
   python --version
   ```

### Step 2: Set Up Backend

1. Open Command Prompt in the backend folder:
   ```
   cd C:\OpenCode Logic\deia-trainer\backend
   ```

2. Create virtual environment:
   ```
   python -m venv venv
   ```

3. Activate virtual environment:
   ```
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```
   python main.py
   ```

   You should see: `Uvicorn running on http://0.0.0.0:8000`

### Step 3: Get Your Computer IP Address

1. Open Command Prompt
2. Run:
   ```
   ipconfig
   ```
3. Look for "IPv4 Address" (usually something like 192.168.1.X)

### Step 4: Update Frontend IP Address

1. Open `frontend/App.js` in a text editor (Notepad, VS Code, etc.)
2. Find this line near the top:
   ```javascript
   const API_URL = 'http://192.168.1.X:8000';
   ```
3. Replace `192.168.1.X` with your actual IP address from Step 3

### Step 5: Install Node.js (If Not Installed)

1. Download from https://nodejs.org/ (LTS version)
2. Install with default settings
3. Verify:
   ```
   node --version
   ```

### Step 6: Build Android APK

1. Open Command Prompt in the frontend folder:
   ```
   cd C:\OpenCode Logic\deia-trainer\frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Generate Android project:
   ```
   npx expo prebuild
   ```

4. Build APK:
   ```
   cd android
   ./gradlew assembleDebug
   ```

5. The APK will be at:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Step 7: Install APK on Phone

1. Send the APK file to your mum's phone (email, WhatsApp, USB)
2. Open the file on her phone
3. If blocked, go to Settings > Security > Allow "Install from unknown sources"
4. Install and open the app

---

## How to Use

### First Time Setup

1. Open the app on the phone
2. Click "Criar Conta" (Create Account)
3. Enter your mum's details:
   - Name: Andrea
   - Nickname: Deia (or whatever she prefers)
   - Email and password
4. Complete onboarding (age, goals, diet preferences)

### Daily Usage

1. **Chat with Carlos**: Tap the big yellow button on home screen
2. **Log exercises**: Tap "Registrar Exercício" → select type → enter duration
3. **Log meals**: Tap "Registrar Refeição" → select meal type → describe food
4. **Track water**: Tap "Água" → tap +250ml button
5. **Set reminders**: Go to Profile → Schedule → Add reminder

### Voice Features

- **Carlos speaks**: Tap the 🔊 button on any of his messages
- He uses Portuguese voice with warm, friendly tone

### Memory System

- Carlos automatically remembers previous conversations
- When memory fills up (~12,000 messages), he:
  1. Creates a summary of important info
  2. Clears old messages
  3. Continues seamlessly
- Your mum never notices this happening!

---

## Troubleshooting

### "Connection refused" error on phone

- Make sure backend is running on your computer
- Make sure you updated the IP address in App.js
- Make sure your computer and phone are on the same WiFi

### "Invalid token" error

- Delete app data and re-login
- Or create a new account

### App doesn't open

- Make sure "Install from unknown sources" is enabled
- Try restarting the phone

---

## Files Included

```
deia-trainer/
├── backend/
│   ├── main.py          # FastAPI server (all endpoints)
│   └── requirements.txt # Python dependencies
│
├── frontend/
│   ├── App.js           # React Native app (all screens)
│   ├── app.json         # Expo configuration
│   └── package.json     # Node dependencies
│
└── README.md            # This file
```

---

## Customization

To change Carlos's appearance:
- Edit the emoji in `App.js` (search for "avatarEmoji")

To change the color scheme:
- Edit `COLORS` object in `App.js`

To change Carlos's personality:
- Edit `CARLOS_SYSTEM_PROMPT` in `backend/main.py`

---

## Support

If you have issues:
1. Check backend is running (Command Prompt window should be open)
2. Check IP address is correct in App.js
3. Check both devices are on same WiFi

Enjoy! 🌻💪