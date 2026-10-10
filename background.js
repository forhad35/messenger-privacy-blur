/**
 * Messenger Privacy Blur - Service Worker (Background)
 */

const DEFAULT_SETTINGS = {
  masterEnabled: true,
  blurMessages: true,
  blurMedia: true,
  blurNames: true,
  blurAvatars: true,
  blurPreviews: true,
  blurInput: false,
  blurRadius: 10,
  blurMediaRadius: 16
};

// Set default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  const storage = chrome.storage.sync || chrome.storage.local;
  storage.get(null, (existing) => {
    const toSet = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (existing[key] === undefined) {
        toSet[key] = DEFAULT_SETTINGS[key];
      }
    }
    if (Object.keys(toSet).length > 0) {
      storage.set(toSet);
    }
  });
});

// Handle keyboard command registered in manifest
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-blur') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggle-master' });
      } catch (err) {
        // Tab might not be a Messenger tab
      }
    }
  }
});
