/**
 * Messenger Privacy Blur - Popup Logic
 */

document.addEventListener('DOMContentLoaded', () => {
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

  const elements = {
    masterEnabled: document.getElementById('masterEnabled'),
    blurMessages: document.getElementById('blurMessages'),
    blurMedia: document.getElementById('blurMedia'),
    blurNames: document.getElementById('blurNames'),
    blurAvatars: document.getElementById('blurAvatars'),
    blurPreviews: document.getElementById('blurPreviews'),
    blurInput: document.getElementById('blurInput'),
    blurRadius: document.getElementById('blurRadius'),
    blurMediaRadius: document.getElementById('blurMediaRadius'),
    textBlurVal: document.getElementById('textBlurVal'),
    mediaBlurVal: document.getElementById('mediaBlurVal'),
    statusBanner: document.getElementById('statusBanner'),
    statusText: document.getElementById('statusText')
  };

  const getStorage = () => chrome.storage.sync || chrome.storage.local;

  // Update UI Banner and dim features if master is off
  function updateMasterUI(isEnabled) {
    if (isEnabled) {
      elements.statusBanner.classList.remove('paused');
      elements.statusBanner.classList.add('active');
      elements.statusText.textContent = 'Protection is Active';
      document.querySelectorAll('.feature-list, .slider-group').forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
    } else {
      elements.statusBanner.classList.remove('active');
      elements.statusBanner.classList.add('paused');
      elements.statusText.textContent = 'Protection is Paused (Alt+B to resume)';
      document.querySelectorAll('.feature-list, .slider-group').forEach(el => {
        el.style.opacity = '0.45';
        el.style.pointerEvents = 'none';
      });
    }
  }

  // Load saved settings
  getStorage().get(DEFAULT_SETTINGS, (settings) => {
    const config = { ...DEFAULT_SETTINGS, ...settings };

    // Set switches
    elements.masterEnabled.checked = config.masterEnabled;
    elements.blurMessages.checked = config.blurMessages;
    elements.blurMedia.checked = config.blurMedia;
    elements.blurNames.checked = config.blurNames;
    elements.blurAvatars.checked = config.blurAvatars;
    elements.blurPreviews.checked = config.blurPreviews;
    elements.blurInput.checked = config.blurInput;

    // Set sliders
    elements.blurRadius.value = config.blurRadius;
    elements.textBlurVal.textContent = `${config.blurRadius}px`;

    elements.blurMediaRadius.value = config.blurMediaRadius;
    elements.mediaBlurVal.textContent = `${config.blurMediaRadius}px`;

    updateMasterUI(config.masterEnabled);
  });

  // Save changes
  function saveSetting(key, value) {
    const data = {};
    data[key] = value;
    getStorage().set(data);
  }

  // Master switch event
  elements.masterEnabled.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    saveSetting('masterEnabled', isChecked);
    updateMasterUI(isChecked);
  });

  // Individual toggles
  const toggleKeys = [
    'blurMessages',
    'blurMedia',
    'blurNames',
    'blurAvatars',
    'blurPreviews',
    'blurInput'
  ];

  toggleKeys.forEach((key) => {
    if (elements[key]) {
      elements[key].addEventListener('change', (e) => {
        saveSetting(key, e.target.checked);
      });
    }
  });

  // Sliders events
  elements.blurRadius.addEventListener('input', (e) => {
    const val = e.target.value;
    elements.textBlurVal.textContent = `${val}px`;
    saveSetting('blurRadius', Number(val));
  });

  elements.blurMediaRadius.addEventListener('input', (e) => {
    const val = e.target.value;
    elements.mediaBlurVal.textContent = `${val}px`;
    saveSetting('blurMediaRadius', Number(val));
  });
});
