// Popup script for the Browsing Archive extension

document.addEventListener('DOMContentLoaded', async () => {
  const urlEl = document.getElementById('current-url');
  const archiveBtn = document.getElementById('archive-btn');
  const tagsInput = document.getElementById('tags-input');
  const messageEl = document.getElementById('message');
  const autoCaptureToggle = document.getElementById('auto-capture-toggle');

  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = tab?.url || '';
  urlEl.textContent = currentUrl;

  // Load settings
  const config = await chrome.storage.local.get(['autoCapture']);
  autoCaptureToggle.checked = !!config.autoCapture;

  // Auto-capture toggle
  autoCaptureToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoCapture: autoCaptureToggle.checked });
  });

  // Show message
  function showMessage(text, type = 'info') {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }

  // Archive button
  archiveBtn.addEventListener('click', async () => {
    if (!currentUrl || currentUrl.startsWith('chrome://')) {
      showMessage('Cannot archive this page', 'error');
      return;
    }

    archiveBtn.disabled = true;
    archiveBtn.textContent = '⏳ Archiving…';

    const tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    chrome.runtime.sendMessage(
      { action: 'archive', url: currentUrl, tags },
      (response) => {
        archiveBtn.disabled = false;
        archiveBtn.textContent = '📥 Archive This Page';

        if (response?.success) {
          if (response.data?.duplicate) {
            showMessage('Already archived!', 'info');
          } else {
            showMessage('Page queued for archiving!', 'success');
            tagsInput.value = '';
          }
        } else {
          showMessage(response?.error || 'Failed to archive', 'error');
        }
      }
    );
  });
});
