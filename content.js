/**
 * Messenger Privacy Blur - Content Script
 * Synchronizes privacy settings and injects dynamic blur controls with intelligent hover reveal.
 */

(() => {
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

  let currentSettings = { ...DEFAULT_SETTINGS };
  let hudTimeout = null;

  // Retrieve storage helper (handles sync or local)
  const getStorage = () => {
    return chrome.storage.sync || chrome.storage.local;
  };

  // Apply settings to document root
  function applySettings(settings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...settings };
    const root = document.documentElement;

    // Master enable / disable
    if (currentSettings.masterEnabled) {
      root.classList.add('msg-blur-enabled');
    } else {
      root.classList.remove('msg-blur-enabled');
    }

    // Individual feature classes
    toggleRootClass('blur-messages', currentSettings.blurMessages);
    toggleRootClass('blur-media', currentSettings.blurMedia);
    toggleRootClass('blur-names', currentSettings.blurNames);
    toggleRootClass('blur-avatars', currentSettings.blurAvatars);
    toggleRootClass('blur-previews', currentSettings.blurPreviews);
    toggleRootClass('blur-input', currentSettings.blurInput);

    // Dynamic blur radius
    const radius = Number(currentSettings.blurRadius) || 10;
    const mediaRadius = Number(currentSettings.blurMediaRadius) || 16;
    root.style.setProperty('--msg-blur-radius', `${radius}px`);
    root.style.setProperty('--msg-blur-media-radius', `${mediaRadius}px`);
  }

  function toggleRootClass(className, shouldAdd) {
    if (shouldAdd) {
      document.documentElement.classList.add(className);
    } else {
      document.documentElement.classList.remove(className);
    }
  }

  // Active hover tracking for 100% reliable unblur on hover
  const activeRevealed = new Set();

  function resetRevealed() {
    if (activeRevealed.size > 0) {
      activeRevealed.forEach((el) => {
        if (el && el.classList) {
          el.classList.remove('msg-revealed');
        }
      });
      activeRevealed.clear();
    }
  }

  // Smart hover reveal listener (Capture phase)
  document.addEventListener('mouseover', (e) => {
    if (!currentSettings.masterEnabled) return;

    const target = e.target;
    if (!target || !(target instanceof Element)) return;

    // Do not reveal if typing in message input
    if (target.closest('[role="textbox"]') || target.closest('[contenteditable="true"]')) {
      return;
    }

    const main = target.closest('[role="main"]');
    if (!main) {
      // Direct avatar or row hover in navigation sidebar or complementary
      const avatarOrRow = target.closest('svg:has(image)') || target.closest('svg') || target.closest('[role="row"]') || target.closest('[role="complementary"]');
      if (avatarOrRow) {
        resetRevealed();
        avatarOrRow.classList.add('msg-revealed');
        activeRevealed.add(avatarOrRow);
        avatarOrRow.querySelectorAll('[dir="auto"], img, video, svg, image').forEach((el) => {
          el.classList.add('msg-revealed');
          activeRevealed.add(el);
        });
      }
      return;
    }

    // 1. Message Bubble, Media, Sticker or Action Buttons in Chat
    const grid = target.closest('[role="grid"]');
    if (grid) {
      const messageRow = target.closest('[role="row"]') || target.closest('[role="gridcell"]');
      if (messageRow) {
        resetRevealed();
        messageRow.classList.add('msg-revealed');
        activeRevealed.add(messageRow);

        target.classList.add('msg-revealed');
        activeRevealed.add(target);
        const dir = target.closest('[dir="auto"]');
        if (dir) {
          dir.classList.add('msg-revealed');
          activeRevealed.add(dir);
        }

        messageRow.querySelectorAll('[dir="auto"], img, video, audio, [role="img"], [aria-label*="sticker" i], [aria-label*="photo" i], [aria-label*="image" i], [aria-label*="video" i], [aria-label*="voice clip" i], [aria-label*="audio" i], svg, svg image').forEach((el) => {
          el.classList.add('msg-revealed');
          activeRevealed.add(el);
        });
        return;
      }

      // Fallback bubble container search
      let node = target;
      let bubbleContainer = null;
      for (let i = 0; i < 7 && node && node !== grid; i++) {
        if (node.querySelector && (node.querySelector('[dir="auto"]') || node.querySelector('img') || node.querySelector('video') || node.querySelector('[role="img"]') || node.querySelector('svg'))) {
          bubbleContainer = node;
          if (node.parentElement === grid || (node.parentElement && node.parentElement.parentElement === grid)) {
            break;
          }
        }
        node = node.parentElement;
      }

      if (bubbleContainer) {
        resetRevealed();
        bubbleContainer.classList.add('msg-revealed');
        activeRevealed.add(bubbleContainer);

        bubbleContainer.querySelectorAll('[dir="auto"], img, video, audio, [role="img"], [aria-label*="sticker" i], [aria-label*="photo" i], svg, svg image').forEach((el) => {
          el.classList.add('msg-revealed');
          activeRevealed.add(el);
        });
        return;
      }
    }

    // 2. Conversation Header Name, Info & Avatar (outside grid, inside main)
    if (!grid && main) {
      resetRevealed();
      const headerItem = target.closest('a') || target.closest('h1') || target.closest('h2') || target.closest('svg:has(image)') || target.closest('div');
      if (headerItem) {
        headerItem.classList.add('msg-revealed');
        activeRevealed.add(headerItem);
        headerItem.querySelectorAll('[dir="auto"], img, video, svg, svg image').forEach((el) => {
          el.classList.add('msg-revealed');
          activeRevealed.add(el);
        });
      }
    }
  }, true);

  document.addEventListener('mouseout', (e) => {
    const related = e.relatedTarget;
    if (!related || !(related instanceof Element)) {
      resetRevealed();
      return;
    }

    // Remove reveal class from elements that no longer contain the cursor
    for (const el of activeRevealed) {
      if (!el.contains(related)) {
        el.classList.remove('msg-revealed');
        activeRevealed.delete(el);
      }
    }
  }, true);

  // Show a sleek toast/HUD notification on shortcut toggle
  function showToast(message, isActive) {
    let hud = document.getElementById('msg-privacy-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'msg-privacy-hud';
      hud.className = 'msg-privacy-hud';
      document.body.appendChild(hud);
    }

    const iconHtml = isActive
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    hud.innerHTML = `
      <div class="msg-privacy-hud-icon">${iconHtml}</div>
      <span>${message}</span>
    `;

    hud.classList.add('show');

    clearTimeout(hudTimeout);
    hudTimeout = setTimeout(() => {
      hud.classList.remove('show');
    }, 1800);
  }

  // Toggle master status
  function toggleMaster() {
    const newStatus = !currentSettings.masterEnabled;
    currentSettings.masterEnabled = newStatus;
    applySettings(currentSettings);

    const storage = getStorage();
    storage.set({ masterEnabled: newStatus }, () => {
      showToast(newStatus ? 'Privacy Blur: Active' : 'Privacy Blur: Off', newStatus);
    });
  }

  // Keyboard shortcut listener (Alt + B)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
      e.preventDefault();
      toggleMaster();
    }
  });

  // Listen for storage changes from popup
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' || areaName === 'local') {
      const updated = { ...currentSettings };
      for (const key of Object.keys(changes)) {
        if (key in DEFAULT_SETTINGS) {
          updated[key] = changes[key].newValue;
        }
      }
      applySettings(updated);
    }
  });

  // Listen for messages from background (e.g., commands)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === 'toggle-master') {
      toggleMaster();
      sendResponse({ success: true, enabled: currentSettings.masterEnabled });
    } else if (message && message.action === 'get-status') {
      sendResponse({ settings: currentSettings });
    }
  });

  // Initial load
  const storage = getStorage();
  storage.get(DEFAULT_SETTINGS, (items) => {
    applySettings(items || DEFAULT_SETTINGS);
  });
})();
