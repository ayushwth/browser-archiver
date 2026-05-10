// Background service worker for the Browsing Archive extension

const DEFAULT_API_URL = 'http://localhost:3001/api';

/**
 * Archive a URL by sending it to the backend
 */
async function archiveUrl(url, tags = []) {
  const config = await chrome.storage.local.get(['apiUrl']);
  const apiUrl = config.apiUrl || DEFAULT_API_URL;

  const response = await fetch(`${apiUrl}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, tags }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Failed to archive');
  }

  return response.json();
}

/**
 * Handle messages from the popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'archive') {
    archiveUrl(message.url, message.tags || [])
      .then((data) => {
        // Show success badge
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#34d399' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);

        sendResponse({ success: true, data });
      })
      .catch((err) => {
        // Show error badge
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#f87171' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 3000);

        sendResponse({ success: false, error: err.message });
      });

    // Return true to indicate async response
    return true;
  }

  if (message.action === 'getConfig') {
    chrome.storage.local.get(['apiUrl', 'autoCapture']).then(sendResponse);
    return true;
  }

  if (message.action === 'setConfig') {
    chrome.storage.local.set(message.config).then(() => sendResponse({ success: true }));
    return true;
  }
});

/**
 * Optional: Auto-capture on tab navigation (disabled by default)
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) return;

  const config = await chrome.storage.local.get(['autoCapture']);
  if (!config.autoCapture) return;

  try {
    await archiveUrl(tab.url);
  } catch (err) {
    console.error('Auto-archive failed:', err.message);
  }
});
