# Messenger Privacy Blur (WA Web Plus Style) 🛡️

A powerful privacy extension for **Messenger.com** and **Facebook Messages** (Chrome Manifest V3). Similar to what **WA Web Plus** does for WhatsApp Web, this extension automatically blurs your chat messages, images, videos, contact names, and profile pictures. When you hover or focus on any element, it smoothly unblurs so only you can see it!

---

## ✨ Key Features

1. 💬 **Chat Messages Blur**: All messages remain blurred until you hover your mouse over them.
2. 🖼️ **Photos, Videos & Media Blur**: Photos, videos, stickers, and voice notes stay hidden until hovered.
3. 👤 **Contact Names Blur**: Blurs contact names in the sidebar and top chat header.
4. 🎭 **Profile Pictures Blur**: Hides avatars and profile pictures across all chats.
5. 📑 **Sidebar Previews Blur**: Hides the latest message snippet in your chat list.
6. ⌨️ **Typing Box Blur**: Blurs what you are drafting until you click or focus into the input box.
7. 🎚️ **Custom Blur Intensity**: Adjust the blur strength using sliders (from 4px to 30px).
8. ⚡ **Quick Shortcut (Panic Key)**: Press `Alt + B` on your keyboard to instantly toggle blur on or off.
9. 🌙 **Modern Dark UI**: A clean, stylish popup control panel.

---

## 🚀 How to Install in Chrome, Brave, Edge, or Opera

1. Open your Chromium browser (**Google Chrome**, **Brave**, **Microsoft Edge**, etc.).
2. In the URL address bar, navigate to:
   ```text
   chrome://extensions/
   ```
   *(For Brave: `brave://extensions/` | For Edge: `edge://extensions/`)*

3. In the top right corner, switch **"Developer mode"** ON.
4. In the top left corner, click **"Load unpacked"**.
5. Select this project folder:
   ```text
   /Users/softvence/messenger-privacy-blur
   ```
6. Click **Select / Open**. The extension is now installed!
7. Click the extension puzzle icon in the browser toolbar and **Pin** "Messenger Privacy Blur".

---

## 🎯 How to Use

1. Go to **[https://www.messenger.com](https://www.messenger.com)** or **[https://www.facebook.com/messages](https://www.facebook.com/messages)**.
2. Refresh the tab (`Cmd + R` on Mac, `F5` on Windows).
3. All messages, media, and names will now be blurred by default.
4. Move your mouse pointer over any message or photo to reveal it. As soon as you move your cursor away, it blurs back.
5. Click the extension icon in the toolbar to toggle specific blur options or adjust the blur intensity sliders.
6. Press **`Alt + B`** on your keyboard anytime to quickly pause or resume privacy protection.

---

## 📁 Project Structure

```
messenger-privacy-blur/
├── manifest.json       # Chrome Extension Manifest V3 configuration
├── popup.html          # Settings UI popup
├── popup.css           # Modern dark styling & toggle switches
├── popup.js            # Settings state manager and Chrome Storage sync
├── content.css         # Smooth blur filters & hover-to-reveal CSS rules
├── content.js          # Injects styles & listens for Alt+B shortcut
├── background.js       # Background service worker & shortcut dispatcher
├── icons/              # Extension icons (16, 32, 48, 128 px)
└── README.md           # Documentation & instructions
```
